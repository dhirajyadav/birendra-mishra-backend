const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const node20Exe = path.resolve(rootDir, '.bin/node-v20.18.0-win-x64/node.exe');
const backendDir = path.resolve(rootDir, 'backend');
const frontendDir = path.resolve(rootDir, 'frontend');
const fs = require('fs');
const localStrapiCli = path.resolve(backendDir, 'node_modules/@strapi/strapi/bin/strapi.js');
const rootStrapiCli = path.resolve(rootDir, 'node_modules/@strapi/strapi/bin/strapi.js');
const strapiCli = fs.existsSync(localStrapiCli) ? localStrapiCli : rootStrapiCli;

function killPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    for (const line of out.split('\n')) {
      const match = line.trim().match(/LISTENING\s+(\d+)/);
      if (match && match[1] !== '0') {
        try { execSync(`taskkill /F /PID ${match[1]}`, { stdio: 'ignore' }); } catch {}
      }
    }
  } catch {}
}

function fetchUrl(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('================================================================');
  console.log('WYSIWYG RICH TEXT EDITOR & END-TO-END VERIFICATION SUITE');
  console.log('================================================================');

  killPort(1337);
  killPort(3000);
  await sleep(1000);

  // 1. Start Strapi (Port 1337)
  console.log('\n[1/5] Starting Strapi backend (Port 1337)...');
  const strapiEnv = {
    ...process.env,
    PATH: `${path.dirname(node20Exe)};${process.env.PATH}`,
    STRAPI_TELEMETRY_DISABLED: 'true',
    XDG_CONFIG_HOME: path.resolve(backendDir, '.config'),
    NODE_ENV: 'production',
  };

  const strapiProc = spawn(node20Exe, [strapiCli, 'start'], {
    cwd: backendDir,
    env: strapiEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  strapiProc.stdout.on('data', (d) => process.stdout.write(`[strapi] ${d}`));
  strapiProc.stderr.on('data', (d) => process.stderr.write(`[strapi err] ${d}`));

  let strapiReady = false;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    try {
      const res = await fetchUrl('http://127.0.0.1:1337/_health', 2000);
      if (res.status === 204 || res.status === 200) {
        strapiReady = true;
        break;
      }
    } catch (e) {
      if (i % 5 === 0) console.log(`[Strapi poll ${i}] ${e.message}`);
    }
  }

  if (!strapiReady) {
    console.error('FAILED: Strapi did not start within 30s');
    strapiProc.kill();
    process.exit(1);
  }
  console.log('✓ Strapi backend is live at http://localhost:1337');

  // Check Admin panel URL
  const adminRes = await fetchUrl('http://127.0.0.1:1337/admin');
  console.log(`✓ Strapi Admin Panel accessible at http://localhost:1337/admin (HTTP ${adminRes.status})`);

  // Check Local CKEditor Bundle
  const ckeditorJsRes = await fetchUrl('http://127.0.0.1:1337/ckeditor5/ckeditor5.umd.js');
  const ckeditorCssRes = await fetchUrl('http://127.0.0.1:1337/ckeditor5/ckeditor5.css');
  console.log(`✓ CKEditor 5 Local JS Bundle accessible (HTTP ${ckeditorJsRes.status}, ${Math.round(ckeditorJsRes.data.length / 1024)} KB)`);
  console.log(`✓ CKEditor 5 Local CSS Bundle accessible (HTTP ${ckeditorCssRes.status}, ${Math.round(ckeditorCssRes.data.length / 1024)} KB)`);

  // 2. Start Next.js (Port 3000)
  console.log('\n[2/5] Starting Next.js frontend (Port 3000)...');
  const wasmDir = path.resolve(frontendDir, 'node_modules/@next/swc-wasm-nodejs');
  const frontendEnv = {
    ...process.env,
    PATH: `${path.dirname(node20Exe)};${process.env.PATH}`,
    NEXT_TEST_WASM_DIR: wasmDir,
  };
  const frontendProc = spawn('node', ['scripts/start.js'], {
    cwd: frontendDir,
    env: frontendEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  frontendProc.stdout.on('data', (d) => process.stdout.write(`[next] ${d}`));
  frontendProc.stderr.on('data', (d) => process.stderr.write(`[next err] ${d}`));

  let nextReady = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetchUrl('http://127.0.0.1:3000/');
      if (res.status === 200 || res.status === 307 || res.status === 308) {
        nextReady = true;
        break;
      } else {
        if (i % 5 === 0) console.log(`[Next.js status ${i}] HTTP ${res.status}`);
      }
    } catch (e) {
      if (i % 5 === 0) console.log(`[Next.js poll ${i}] ${e.message}`);
    }
  }

  if (!nextReady) {
    console.error('FAILED: Next.js failed to start within 30s');
    try { execSync(`taskkill /F /T /PID ${strapiProc.pid}`, { stdio: 'ignore' }); } catch {}
    try { execSync(`taskkill /F /T /PID ${frontendProc.pid}`, { stdio: 'ignore' }); } catch {}
    process.exit(1);
  }
  console.log('✓ Next.js frontend is live at http://localhost:3000');

  // 3. Test Strapi API with CKEditor Content Field
  console.log('\n[3/5] Testing Strapi API for Article with Rich Text Content...');
  const apiRes = await fetchUrl('http://127.0.0.1:1337/api/articles?filters[slug][$eq]=future-of-strategic-financial-leadership&populate=*');
  console.log('Strapi API Response Status:', apiRes.status);
  const apiJson = JSON.parse(apiRes.data);
  const article = apiJson.data?.[0];

  if (!article) {
    console.error('FAILED: Article not found in Strapi API!');
  } else {
    console.log('✓ Article retrieved successfully from Strapi API:');
    console.log('   - Title:', article.title);
    console.log('   - Slug:', article.slug);
    console.log('   - Author:', article.author?.name);
    console.log('   - Category:', article.category?.name);
    console.log('   - Tags:', article.tags?.map((t) => t.name).join(', '));
    console.log('   - Rich Text Content Length:', article.content?.length, 'chars');
    console.log('   - Dynamic Zone Blocks count:', article.blocks?.length);
  }

  // 4. Test Frontend Archive
  console.log('\n[4/5] Testing Frontend Insights Archive...');
  const archiveRes = await fetchUrl('http://localhost:3000/insights');
  console.log('Archive status:', archiveRes.status);
  const inArchive = archiveRes.data.includes('future-of-strategic-financial-leadership') || archiveRes.data.includes('The Future of Strategic Financial Leadership');
  console.log(`Article present in /insights archive: ${inArchive ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 5. Test Frontend Article Detail Page & 14 Content Elements
  console.log('\n[5/5] Testing Frontend Article Detail Page & All 14 WYSIWYG Elements...');
  const detailRes = await fetchUrl('http://localhost:3000/insights/future-of-strategic-financial-leadership');
  console.log('Detail page status:', detailRes.status);

  const html = detailRes.data;

  const checks = [
    { num: 1, label: '1. H2 Heading', pass: html.includes('The Changing Landscape of Financial Leadership') },
    { num: 2, label: '2. Multiple Paragraphs', pass: html.includes('Modern financial leaders are rapidly moving beyond') && html.includes('To effectively steer organizations through volatility') },
    { num: 3, label: '3. Bold and Italic Emphasis', pass: html.includes('executive stewardship') && html.includes('cross-functional operational synthesis') },
    { num: 4, label: '4. Bullet List', pass: html.includes('Capital Allocation Agility') && html.includes('Enterprise Risk Management') },
    { num: 5, label: '5. Numbered List', pass: html.includes('Establish a unified enterprise data architecture') && html.includes('Strengthen board-level governance') },
    { num: 6, label: '6. Hyperlink (open in new tab)', pass: html.includes('/insights') && html.includes('target="_blank"') },
    { num: 7, label: '7. Image with Persistent URL', pass: html.includes('/assets/oil-platforms.jpg') || html.includes('oil-platforms') },
    { num: 8, label: '8. Image Caption', pass: html.includes('Capital allocation and disciplined financial oversight') },
    { num: 9, label: '9. YouTube Video Embed (16:9)', pass: html.includes('youtube.com/embed/dQw4w9WgXcQ') && html.includes('article-embed-responsive') },
    { num: 10, label: '10. Quote Block with Citation', pass: html.includes('Strategic financial leadership is not about reporting history') && html.includes('Birendra Mishra') && html.includes('Strategic Financial Advisory') },
    { num: 11, label: '11. Comparison Table with Headers', pass: html.includes('Traditional Accounting') && html.includes('Strategic Financial Leadership') && html.includes('article-table') },
    { num: 12, label: '12. Call to Action (CTA Button)', pass: html.includes('Explore Advisory Services') && html.includes('/#contact') },
    { num: 13, label: '13. Highlighted Callout Box', pass: html.includes('article-highlight-box') && html.includes('Executive Takeaway') },
    { num: 14, label: '14. PDF Download Card', pass: html.includes('article-download-card') && html.includes('Strategic Financial Leadership Executive Framework') },
  ];

  console.log('\n--- Verification of 14 WYSIWYG Content Elements ---');
  let allElementsPassed = true;
  for (const c of checks) {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`);
    if (!c.pass) allElementsPassed = false;
  }

  // 6. Test Live Preview Mode
  console.log('\n--- Checking Live Preview Mode (?preview=true) ---');
  const previewRes = await fetchUrl('http://localhost:3000/insights/future-of-strategic-financial-leadership?preview=true');
  console.log('Preview mode status:', previewRes.status);
  const hasPreviewBanner = previewRes.data.includes('Live Draft Preview Mode');
  console.log(`Preview banner present: ${hasPreviewBanner ? 'YES (PASS)' : 'NO (FAIL)'}`);

  const overallSuccess = allElementsPassed && inArchive && hasPreviewBanner && (apiRes.status === 200) && (adminRes.status === 200);

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${overallSuccess ? 'ALL VERIFICATIONS PASSED SUCCESSFULLY ✓' : 'SOME CHECKS FAILED'}`);
  console.log('================================================================');

  // Clean shutdown
  console.log('\nShutting down servers...');
  try { execSync(`taskkill /F /T /PID ${strapiProc.pid}`, { stdio: 'ignore' }); } catch {}
  try { execSync(`taskkill /F /T /PID ${frontendProc.pid}`, { stdio: 'ignore' }); } catch {}

  process.exit(overallSuccess ? 0 : 1);
}

main().catch((err) => {
  console.error('Suite error:', err);
  process.exit(1);
});


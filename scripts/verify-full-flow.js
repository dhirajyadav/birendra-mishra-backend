const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const node20Exe = path.resolve(rootDir, '.bin/node-v20.18.0-win-x64/node.exe');
const strapiCli = path.resolve(rootDir, 'backend/node_modules/@strapi/strapi/bin/strapi.js');
const backendDir = path.resolve(rootDir, 'backend');
const frontendDir = path.resolve(rootDir, 'frontend');

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

async function main() {
  console.log('======================================================');
  console.log('END-TO-END CMS & FRONTEND VERIFICATION SUITE');
  console.log('======================================================');

  killPort(1337);
  killPort(3000);
  await sleep(1000);

  // 1. Start Strapi (Port 1337)
  console.log('\n[1/4] Starting Strapi backend on port 1337...');
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

  strapiProc.stdout.on('data', (d) => {
    // process.stdout.write(`[strapi] ${d}`);
  });
  strapiProc.stderr.on('data', (d) => {
    // process.stderr.write(`[strapi err] ${d}`);
  });

  // Wait for Strapi health check
  let strapiReady = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetchUrl('http://127.0.0.1:1337/_health');
      if (res.status === 204 || res.status === 200) {
        strapiReady = true;
        break;
      }
    } catch {}
  }

  if (!strapiReady) {
    console.error('Strapi failed to start within 30s');
    strapiProc.kill();
    process.exit(1);
  }
  console.log('✓ Strapi backend is live at http://localhost:1337');

  // 2. Start Next.js (Port 3000)
  console.log('\n[2/4] Starting Next.js frontend on port 3000...');
  const wasmDir = path.resolve(frontendDir, 'node_modules/@next/swc-wasm-nodejs');
  const frontendProc = spawn('npx.cmd', ['next', 'start', '-p', '3000'], {
    cwd: frontendDir,
    env: { ...process.env, NEXT_TEST_WASM_DIR: wasmDir },
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  frontendProc.stdout.on('data', (d) => {
    process.stdout.write(`[next] ${d}`);
  });
  frontendProc.stderr.on('data', (d) => {
    process.stderr.write(`[next err] ${d}`);
  });

  let nextReady = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetchUrl('http://localhost:3000/');
      if (res.status === 200) {
        nextReady = true;
        break;
      }
    } catch (e) {
      if (i % 5 === 0) console.log(`[Next.js poll ${i}] ${e.message}`);
    }
  }

  if (!nextReady) {
    console.error('Next.js failed to start within 30s');
    strapiProc.kill();
    frontendProc.kill();
    process.exit(1);
  }
  console.log('✓ Next.js frontend is live at http://localhost:3000');

  // 3. Test Strapi API
  console.log('\n[3/4] Testing Strapi API endpoint for test article...');
  const apiRes = await fetchUrl('http://127.0.0.1:1337/api/articles?filters[slug][$eq]=future-of-strategic-financial-leadership&populate=*');
  console.log('Strapi API Response Status:', apiRes.status);
  const apiJson = JSON.parse(apiRes.data);
  const article = apiJson.data?.[0];

  if (!article) {
    console.error('FAILED: Article not found in Strapi API response!');
  } else {
    console.log('✓ Article retrieved successfully from Strapi API:');
    console.log('   - ID:', article.id);
    console.log('   - Document ID:', article.documentId);
    console.log('   - Title:', article.title);
    console.log('   - Slug:', article.slug);
    console.log('   - Published At:', article.publishedAt);
    console.log('   - Author:', article.author?.name);
    console.log('   - Category:', article.category?.name);
    console.log('   - Tags:', article.tags?.map((t) => t.name).join(', '));
    console.log('   - Blocks in Strapi API:', article.blocks?.length);
  }

  // 4. Test Frontend Pages
  console.log('\n[4/4] Testing Frontend Routes & Dynamic Block Rendering...');

  // 4a. Archive Listing
  console.log('\n--- Checking /insights archive listing ---');
  const insightsRes = await fetchUrl('http://127.0.0.1:3000/insights');
  console.log('Archive page status:', insightsRes.status);
  const containsInArchive = insightsRes.data.includes('future-of-strategic-financial-leadership') || insightsRes.data.includes('The Future of Strategic Financial Leadership');
  console.log(`Article present in /insights archive: ${containsInArchive ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 4b. Article Detail Page
  console.log('\n--- Checking /insights/future-of-strategic-financial-leadership detail page ---');
  const detailRes = await fetchUrl('http://127.0.0.1:3000/insights/future-of-strategic-financial-leadership');
  console.log('Detail page status:', detailRes.status);

  const html = detailRes.data;

  // Verifications
  const checks = [
    { label: 'Title present', pass: html.includes('The Future of Strategic Financial Leadership: Technology, Innovation &amp; Business Growth') || html.includes('The Future of Strategic Financial Leadership') },
    { label: 'Author present ("Birendra Mishra")', pass: html.includes('Birendra Mishra') },
    { label: 'Category present ("Leadership")', pass: html.includes('Leadership') },
    { label: 'Reading time present ("8 minutes")', pass: html.includes('8 minutes') || html.includes('8 min read') },
    { label: 'Heading 1 ("The Changing Landscape of Financial Leadership")', pass: html.includes('The Changing Landscape of Financial Leadership') },
    { label: 'Paragraph 1 (Intro text)', pass: html.includes('Modern financial leaders are moving beyond traditional accounting') },
    { label: 'Paragraph 2 (Volatility & technology)', pass: html.includes('To steer organizations through volatility') },
    { label: 'Heading 2 ("Why Strategic Financial Leadership Matters")', pass: html.includes('Why Strategic Financial Leadership Matters') },
    { label: 'Paragraph 3 (Value creation)', pass: html.includes('Finance is no longer just scorekeeping') },
    { label: 'Paragraph 4 (Executive priorities)', pass: html.includes('Executive Priorities in Modern Enterprise Management') },
    { label: 'Executive Quote present', pass: html.includes('Strategic financial leadership is not about reporting history') },
    { label: 'Quote Author & Cite present', pass: html.includes('Birendra Mishra') && html.includes('Strategic Financial Advisory') },
    { label: 'Heading 3 ("Key Pillars of Future Financial Strategy")', pass: html.includes('Key Pillars of Future Financial Strategy') },
    { label: 'Paragraph 5 (Pillars text)', pass: html.includes('A sustainable corporate finance model integrates') },
    { label: 'Heading 4 ("Practical Advice for Modern Finance Leaders")', pass: html.includes('Practical Advice for Modern Finance Leaders') },
    { label: 'Paragraph 6 (Practical advice text)', pass: html.includes('Build cross-disciplinary literacy across cloud infrastructure') },
    { label: 'CTA Button present ("Explore Advisory Services")', pass: html.includes('Explore Advisory Services') },
    { label: 'CTA Button URL ("/#contact")', pass: html.includes('/#contact') },
  ];

  console.log('\n--- Detail Page Content & Block Checks ---');
  let allChecksPassed = true;
  for (const c of checks) {
    console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.label}`);
    if (!c.pass) allChecksPassed = false;
  }

  console.log('\n======================================================');
  console.log(`FINAL RESULT: ${allChecksPassed ? 'ALL VERIFICATIONS PASSED ✓' : 'SOME CHECKS FAILED'}`);
  console.log('======================================================');

  // Clean shutdown
  console.log('\nShutting down servers...');
  try { execSync(`taskkill /F /T /PID ${strapiProc.pid}`, { stdio: 'ignore' }); } catch {}
  try { execSync(`taskkill /F /T /PID ${frontendProc.pid}`, { stdio: 'ignore' }); } catch {}

  process.exit(allChecksPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Suite error:', err);
  process.exit(1);
});


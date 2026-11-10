const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const fs = require('fs');
const nodeExe = path.resolve(__dirname, '../../.bin/node-v20.18.0-win-x64/node.exe');
let strapiCli = path.resolve(__dirname, '../node_modules/@strapi/strapi/bin/strapi.js');
if (!fs.existsSync(strapiCli)) {
  strapiCli = path.resolve(__dirname, '../../node_modules/@strapi/strapi/bin/strapi.js');
}

function fetchUrl(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('[PROBE] Starting Strapi backend using Node 20...');
  const strapiEnv = {
    ...process.env,
    PATH: `${path.dirname(nodeExe)};${process.env.PATH}`,
    STRAPI_TELEMETRY_DISABLED: 'true',
    XDG_CONFIG_HOME: path.resolve(__dirname, '../.config'),
    NODE_ENV: 'production',
  };

  const strapiProcess = spawn(nodeExe, [strapiCli, 'start'], {
    cwd: path.resolve(__dirname, '..'),
    env: strapiEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  strapiProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    process.stdout.write(`[Strapi stdout]: ${msg}`);
  });

  strapiProcess.stderr.on('data', (data) => {
    process.stderr.write(`[Strapi stderr]: ${data.toString()}`);
  });

  // Wait for server to become reachable
  console.log('[PROBE] Polling for server readiness at http://127.0.0.1:1337/_health ...');
  let ready = false;
  const startTime = Date.now();
  const maxWait = 45000; // 45 seconds

  while (Date.now() - startTime < maxWait) {
    try {
      const res = await fetchUrl('http://127.0.0.1:1337/_health', 2000);
      if (res.statusCode === 204 || res.statusCode === 200) {
        ready = true;
        console.log(`[PROBE] Strapi is ready! HTTP ${res.statusCode}`);
        break;
      } else {
        console.log(`[PROBE] Status: ${res.statusCode}`);
      }
    } catch (e) {
      console.log(`[PROBE poll retry]: ${e.message}`);
    }
    await sleep(2000);
  }

  if (!ready) {
    console.error('[PROBE] ERROR: Strapi failed to become ready within timeout');
    strapiProcess.kill('SIGKILL');
    process.exit(1);
  }

  const endpoints = [
    { name: 'Root URL', url: 'http://127.0.0.1:1337' },
    { name: 'Admin Panel', url: 'http://127.0.0.1:1337/admin' },
    { name: 'Health Check API', url: 'http://127.0.0.1:1337/_health' },
    { name: 'Global Settings API', url: 'http://127.0.0.1:1337/api/global' },
    { name: 'Homepage API', url: 'http://127.0.0.1:1337/api/homepage?populate=*' },
    { name: 'Articles API', url: 'http://127.0.0.1:1337/api/articles' },
    { name: 'LinkedIn OAuth API', url: 'http://127.0.0.1:1337/api/linkedin/auth' },
    { name: 'LinkedIn Status API', url: 'http://127.0.0.1:1337/api/linkedin/status' },
    { name: 'LinkedIn Queue API', url: 'http://127.0.0.1:1337/api/linkedin/queue' },
  ];

  let allPassed = true;
  for (const ep of endpoints) {
    try {
      const res = await fetchUrl(ep.url);
      console.log(`[PASS] ${ep.name} (${ep.url}) -> HTTP ${res.statusCode}`);
      if (res.statusCode >= 400 && res.statusCode !== 404) {
        console.warn(`[WARN] Status for ${ep.name}: ${res.statusCode} - Data: ${res.data.slice(0, 100)}`);
      } else if (res.statusCode === 200) {
        console.log(`       Preview: ${res.data.slice(0, 80)}...`);
      }
    } catch (err) {
      console.error(`[FAIL] ${ep.name} (${ep.url}):`, err.message);
      allPassed = false;
    }
  }

  console.log('[PROBE] Shutting down test Strapi instance...');
  strapiProcess.kill('SIGTERM');
  await sleep(2000);
  try {
    strapiProcess.kill('SIGKILL');
  } catch (e) {}

  if (allPassed) {
    console.log('[PROBE SUCCESS] All Strapi endpoints verified successfully!');
    process.exit(0);
  } else {
    console.error('[PROBE FAILURE] Some endpoints failed.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});

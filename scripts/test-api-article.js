const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const nodeExe = path.resolve(__dirname, '../../.bin/node-v20.18.0-win-x64/node.exe');
const strapiCli = path.resolve(__dirname, '../node_modules/@strapi/strapi/bin/strapi.js');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('[TEST] Starting Strapi on port 1337...');
  const strapiEnv = {
    ...process.env,
    PATH: `${path.dirname(nodeExe)};${process.env.PATH}`,
    STRAPI_TELEMETRY_DISABLED: 'true',
    XDG_CONFIG_HOME: path.resolve(__dirname, '../.config'),
    NODE_ENV: 'production',
  };

  const proc = spawn(nodeExe, [strapiCli, 'start'], {
    cwd: path.resolve(__dirname, '..'),
    env: strapiEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (d) => process.stdout.write(`[strapi] ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`[strapi err] ${d}`));

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetchJson('http://127.0.0.1:1337/_health');
      if (res.status === 204 || res.status === 200) {
        ready = true;
        break;
      }
    } catch {}
  }

  if (!ready) {
    console.error('Strapi failed to start in 30s');
    proc.kill();
    process.exit(1);
  }

  console.log('\n--- Strapi is ready! Testing API queries ---');

  console.log('\n1. Testing query with populate=*');
  const resStar = await fetchJson('http://127.0.0.1:1337/api/articles?filters[slug][$eq]=future-of-strategic-financial-leadership&populate=*');
  console.log('Status:', resStar.status);
  console.log('Data count:', resStar.json?.data?.length);
  if (resStar.json?.data?.length > 0) {
    const art = resStar.json.data[0];
    console.log('Article Title:', art.title);
    console.log('Article Slug:', art.slug);
    console.log('Author:', art.author?.name);
    console.log('Category:', art.category?.name);
    console.log('Tags:', art.tags?.map((t) => t.name));
    console.log('Blocks count:', art.blocks?.length);
    console.log('Blocks sample:', JSON.stringify(art.blocks?.slice(0, 3), null, 2));
  }

  console.log('\n2. Testing query with populate=deep');
  const resDeep = await fetchJson('http://127.0.0.1:1337/api/articles?filters[slug][$eq]=future-of-strategic-financial-leadership&populate=deep');
  console.log('Status with populate=deep:', resDeep.status);
  console.log('Data count:', resDeep.json?.data?.length);
  if (resDeep.json?.data?.length > 0) {
    const art = resDeep.json.data[0];
    console.log('Blocks count with populate=deep:', art.blocks?.length);
    console.log('Blocks is undefined?', art.blocks === undefined);
  }

  console.log('\nShutting down Strapi...');
  proc.kill('SIGTERM');
  await sleep(1500);
}

main().catch(console.error);


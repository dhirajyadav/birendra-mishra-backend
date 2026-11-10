const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const node20 = path.resolve(__dirname, '../../.bin/node-v20.18.0-win-x64/node.exe');
const useNode20 = fs.existsSync(node20) && process.versions.node.startsWith('24');
const targetNode = useNode20 ? node20 : process.execPath;

let args = process.argv.slice(2);
if (args.length > 0 && args[0].includes('strapi.js')) {
  const localCli = path.resolve(__dirname, '..', args[0]);
  const rootCli = path.resolve(__dirname, '../..', args[0]);
  if (!fs.existsSync(localCli) && fs.existsSync(rootCli)) {
    args[0] = rootCli;
  }
}
const env = {
  ...process.env,
  PATH: useNode20 ? `${path.dirname(node20)};${process.env.PATH}` : process.env.PATH,
  STRAPI_TELEMETRY_DISABLED: 'true',
  XDG_CONFIG_HOME: path.resolve(__dirname, '../.config'),
};

try {
  require('./copy-schemas.js');
} catch {}

const child = spawn(targetNode, args, {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  process.exit(code || (signal ? 1 : 0));
});


const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const strapiUtils = require('@strapi/utils');

const configDir = path.resolve(__dirname, '../dist/config');
const allFiles = fs.readdirSync(configDir, { withFileTypes: true });
const configFiles = allFiles.filter(f => f.isFile() && f.name.endsWith('.js'));

const baseConfig = {};
for (const file of configFiles) {
  const key = path.basename(file.name, path.extname(file.name));
  const fullPath = path.resolve(configDir, file.name);
  const jsModule = strapiUtils.importDefault(fullPath);
  const val = typeof jsModule === 'function' ? jsModule({ env: strapiUtils.env }) : jsModule;
  baseConfig[key] = val;
}

console.log('baseConfig.database:', baseConfig.database);
console.log('keys in baseConfig:', Object.keys(baseConfig));


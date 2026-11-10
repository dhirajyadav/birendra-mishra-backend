const path = require('path');
const strapiUtils = require('@strapi/utils');
const fn = strapiUtils.importDefault(path.resolve(__dirname, '../dist/config/database.js'));
console.log('fn type:', typeof fn);
const res = fn({ env: strapiUtils.env });
console.log('res:', JSON.stringify(res, null, 2));


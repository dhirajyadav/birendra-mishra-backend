const { createStrapi } = require('@strapi/strapi');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function check() {
  const strapi = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  });
  await strapi.load();
  console.log('database config:', strapi.config.get('database'));
  await strapi.destroy();
}

check().catch(console.error);


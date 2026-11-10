const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function test() {
  try {
    const app = await createStrapi({ appDir: path.resolve(__dirname, '..'), distDir: path.resolve(__dirname, '../dist') }).load();
    console.log('Strapi loaded successfully!');
    console.log('Has documents api:', typeof app.documents);
    await app.destroy();
  } catch (err) {
    console.error('Error bootstrapping Strapi:', err);
    process.exit(1);
  }
}

test();

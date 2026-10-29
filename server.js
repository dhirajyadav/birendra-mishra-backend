
const strapi = require('@strapi/strapi');

strapi
  .createStrapi({
    distDir: './dist',
  })
  .start()
  .catch((error) => {
    console.error('Failed to start Strapi:', error);
    process.exit(1);
  });

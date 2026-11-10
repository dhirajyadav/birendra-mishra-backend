const { createStrapi } = require('@strapi/strapi');
const path = require('path');
const initialHomepageData = require('../src/data/initial-homepage.json');

async function seedHomepage() {
  console.log('Initializing Strapi instance to seed Homepage Single Type...');
  const strapi = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  }).load();

  try {
    console.log('Checking if homepage already exists...');
    let existing = null;
    try {
      existing = await strapi.documents('api::homepage.homepage').findFirst();
    } catch (e) {
      existing = await strapi.entityService.findMany('api::homepage.homepage');
    }

    if (!existing) {
      console.log('No homepage found. Seeding initial homepage data with all 10 sections...');
      if (strapi.documents) {
        await strapi.documents('api::homepage.homepage').create({
          data: initialHomepageData,
          status: 'published',
        });
      } else {
        await strapi.entityService.create('api::homepage.homepage', {
          data: {
            ...initialHomepageData,
            publishedAt: new Date(),
          },
        });
      }
      console.log('✓ Homepage successfully seeded and published!');
    } else {
      console.log('✓ Homepage already exists in database with document id:', existing.documentId || existing.id);
    }
  } catch (err) {
    console.error('Error seeding homepage:', err);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

seedHomepage();


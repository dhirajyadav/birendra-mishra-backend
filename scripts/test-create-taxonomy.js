const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function test() {
  const app = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  }).load();

  try {
    console.log('Testing category creation with app.documents:');
    let category = await app.documents('api::category.category').findFirst({
      filters: { slug: 'leadership' },
    });

    if (!category) {
      category = await app.documents('api::category.category').create({
        data: {
          name: 'Leadership',
          slug: 'leadership',
          description: 'Strategic leadership, governance, and organizational transformation.',
        },
        status: 'published',
      });
      console.log('Created Leadership category:', category);
    } else {
      console.log('Found existing Leadership category:', category);
    }

    // Test tags
    const tagNames = [
      'Strategic Finance',
      'Digital Transformation',
      'Financial Leadership',
      'Business Strategy',
      'Technology',
    ];

    const tagDocs = [];
    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let tag = await app.documents('api::tag.tag').findFirst({
        filters: { slug },
      });
      if (!tag) {
        tag = await app.documents('api::tag.tag').create({
          data: { name, slug },
          status: 'published',
        });
        console.log(`Created tag ${name}:`, tag.documentId);
      } else {
        console.log(`Found tag ${name}:`, tag.documentId);
      }
      tagDocs.push(tag);
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await app.destroy();
  }
}

test();


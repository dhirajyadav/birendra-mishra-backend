const { createStrapi } = require('@strapi/strapi');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function inspect() {
  const strapi = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  });
  await strapi.load();

  try {
    const hp = await strapi.documents('api::homepage.homepage').findFirst({
      populate: {
        hero: { populate: '*' },
        pillars: { populate: '*' },
        meetBirendra: { populate: '*' },
        purposeMissionValues: { populate: '*' },
        aspiration: { populate: '*' },
        capabilities: { populate: '*' },
        insights: { populate: '*' },
        advisory: { populate: '*' },
        faq: { populate: '*' },
        contact: { populate: '*' },
      },
    });
    console.log('=== HOMEPAGE INSPECTION ===');
    console.log('Document ID:', hp?.documentId);
    console.log('Hero eyebrow:', hp?.hero?.eyebrow);
    console.log('Hero titlePrefix:', hp?.hero?.titlePrefix);
    console.log('Hero trustItems count:', hp?.hero?.trustItems?.length);
    console.log('Pillars items count:', hp?.pillars?.items?.length);
    console.log('MeetBirendra title:', hp?.meetBirendra?.title);
    console.log('MeetBirendra tagBadges count:', hp?.meetBirendra?.tagBadges?.length);
    console.log('MeetBirendra capabilityValueCards count:', hp?.meetBirendra?.capabilityValueCards?.length);
    console.log('PurposeMissionValues title:', hp?.purposeMissionValues?.title);
    console.log('Aspiration quote length:', hp?.aspiration?.quote?.length);
    console.log('Aspiration pillars count:', hp?.aspiration?.pillars?.length);
    console.log('Capabilities pillars count:', hp?.capabilities?.pillars?.length);
    console.log('Insights heading:', hp?.insights?.heading);
    console.log('Insights fallbackCards count:', hp?.insights?.fallbackCards?.length);
    console.log('Advisory title:', hp?.advisory?.title);
    console.log('Advisory items count:', hp?.advisory?.items?.length);
    console.log('FAQ items count:', hp?.faq?.items?.length);
    console.log('Contact titleKicker:', hp?.contact?.titleKicker);
    console.log('SEO title:', hp?.seoTitle);
    console.log('===========================');
  } catch (err) {
    console.error('Inspect error:', err);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

inspect();

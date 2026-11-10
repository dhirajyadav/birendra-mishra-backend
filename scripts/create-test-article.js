/**
 * Script: create-test-article.js
 * Creates and publishes the complete dummy test article in Strapi 5 Headless CMS.
 */

const path = require('path');
const { createStrapi } = require('@strapi/strapi');

async function main() {
  console.log('[1/5] Bootstrapping Strapi instance...');
  const app = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  }).load();
  global.strapi = app;

  try {
    // 1. Author
    console.log('[2/5] Resolving Author (Birendra Mishra)...');
    let author = await app.documents('api::author.author').findFirst({
      filters: { name: 'Birendra Mishra' },
    });
    if (!author) {
      author = await app.documents('api::author.author').create({
        data: {
          name: 'Birendra Mishra',
          role: 'Senior Executive | Global Financial Strategy, M&A and Capital Governance',
          bio: 'Over two decades across international corporate headquarters and complex upstream energy operations.',
        },
        status: 'published',
      });
      console.log('Created default author Birendra Mishra:', author.documentId);
    } else {
      console.log('Found author Birendra Mishra:', author.documentId);
    }

    // 2. Category
    console.log('[3/5] Resolving Category (Leadership)...');
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
      console.log('Created Category Leadership:', category.documentId);
    } else {
      console.log('Found Category Leadership:', category.documentId);
    }

    // 3. Tags
    console.log('[4/5] Resolving Tags...');
    const tagNames = [
      'Strategic Finance',
      'Digital Transformation',
      'Financial Leadership',
      'Business Strategy',
      'Technology',
    ];

    const tagDocIds = [];
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
        console.log(`Created tag "${name}":`, tag.documentId);
      } else {
        console.log(`Found tag "${name}":`, tag.documentId);
      }
      tagDocIds.push(tag.documentId);
    }

    // 4. Test Article Blocks (using the 4 backend dynamic zone components)
    const editorialBlocks = [
      {
        __component: 'article-blocks.heading',
        level: 'h2',
        text: 'The Changing Landscape of Financial Leadership',
      },
      {
        __component: 'article-blocks.paragraph',
        content:
          'Modern financial leaders are moving beyond traditional accounting and financial reporting to become strategic business partners. In an era marked by rapid market disruption and volatile global capital dynamics, executive finance leadership requires proactive business transformation, multi-horizon financial planning, data-driven decisions, and enterprise technology adoption to foster long-term value creation.',
      },
      {
        __component: 'article-blocks.paragraph',
        content:
          'To steer organizations through volatility, finance leaders must understand technology, business operations, customer behavior, and market dynamics. Siloed balance-sheet management is no longer sufficient; executive stewardship requires cross-functional operational synthesis.',
      },
      {
        __component: 'article-blocks.heading',
        level: 'h2',
        text: 'Why Strategic Financial Leadership Matters',
      },
      {
        __component: 'article-blocks.paragraph',
        content:
          'Finance is no longer just scorekeeping — it is active value creation. Strategic CFOs anticipate market headwinds, structure capital reserves before liquidity crises emerge, and translate strategic ambition into disciplined capital allocation.',
      },
      {
        __component: 'article-blocks.paragraph',
        content:
          'Executive Priorities in Modern Enterprise Management:\n• Capital Allocation Agility: Dynamically deploying capital to high-yield and growth-critical initiatives while maintaining balance-sheet liquidity.\n• Digital & AI Transformation: Automating core reconciliations to empower finance teams with predictive scenario modeling.\n• Risk Governance & Fiduciary Integrity: Balancing aggressive market expansion with rigorous compliance, internal controls, and enterprise audit-readiness.',
      },
      {
        __component: 'article-blocks.quote',
        quote:
          'Strategic financial leadership is not about reporting history. It is about navigating uncertainty, allocating capital with precision, and architecting the future of the enterprise.',
        author: 'Birendra Mishra',
        cite: 'Strategic Financial Advisory',
      },
      {
        __component: 'article-blocks.heading',
        level: 'h2',
        text: 'Key Pillars of Future Financial Strategy',
      },
      {
        __component: 'article-blocks.paragraph',
        content:
          'A sustainable corporate finance model integrates real-time forecasting, automated liquidity monitoring, and strategic M&A evaluations. By establishing robust governance frameworks and transparent KPI cascades, executive leadership creates resilient organizational structures capable of compounding enterprise value over decades.',
      },
      {
        __component: 'article-blocks.heading',
        level: 'h2',
        text: 'Practical Advice for Modern Finance Leaders',
      },
      {
        __component: 'article-blocks.paragraph',
        content:
          '1. Build cross-disciplinary literacy across cloud infrastructure, artificial intelligence, and data analytics.\n2. Engage as an executive co-pilot alongside business unit leaders, ensuring commercial decisions are backed by rigorous unit economics.\n3. Institutionalize governance and internal controls as strategic competitive advantages rather than regulatory burdens.',
      },
      {
        __component: 'article-blocks.cta-button',
        label: 'Explore Advisory Services',
        url: '/#contact',
        variant: 'primary',
        isExternal: false,
      },
    ];

    console.log('[5/5] Creating / updating published test article...');
    const existing = await app.documents('api::article.article').findFirst({
      filters: { slug: 'future-of-strategic-financial-leadership' },
    });

    const articlePayload = {
      title: 'The Future of Strategic Financial Leadership: Technology, Innovation & Business Growth',
      slug: 'future-of-strategic-financial-leadership',
      excerpt:
        'Explore how modern financial leadership, digital transformation, data-driven decision-making and emerging technologies are reshaping the future of business growth.',
      shortDescription:
        'A practical exploration of the evolving role of strategic financial leaders in a technology-driven business environment.',
      readingTime: '8 minutes',
      featuredArticle: true,
      seoTitle: 'The Future of Strategic Financial Leadership | Birendra Mishra',
      seoDescription:
        'Discover how strategic financial leadership, technology, data analytics and digital transformation drive sustainable business growth.',
      author: author.documentId,
      category: category.documentId,
      tags: tagDocIds,
      blocks: editorialBlocks,
    };

    let result;
    if (existing) {
      console.log('Updating existing article document:', existing.documentId);
      result = await app.documents('api::article.article').update({
        documentId: existing.documentId,
        data: articlePayload,
        status: 'published',
      });
    } else {
      console.log('Creating new article document...');
      result = await app.documents('api::article.article').create({
        data: articlePayload,
        status: 'published',
      });
    }

    console.log('\n=============================================');
    console.log('TEST ARTICLE CREATED & PUBLISHED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('ID:', result.id);
    console.log('Document ID:', result.documentId);
    console.log('Title:', result.title);
    console.log('Slug:', result.slug);
    console.log('Published At:', result.publishedAt);
    console.log('Author:', author.name);
    console.log('Category:', category.name);
    console.log('Tags Count:', tagDocIds.length);
    console.log('Blocks Count:', editorialBlocks.length);
    console.log('=============================================');

    // Exit cleanly without waiting on unref'd timers
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during test article publication:', err);
    process.exit(1);
  }
}

main();

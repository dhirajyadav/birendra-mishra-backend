const { createStrapi } = require('@strapi/strapi');
const path = require('path');

async function testArticleCreation() {
  const app = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  }).load();

  try {
    const author = await app.documents('api::author.author').findFirst({
      filters: { name: 'Birendra Mishra' },
    });
    console.log('Author found:', author?.documentId);

    const category = await app.documents('api::category.category').findFirst({
      filters: { slug: 'leadership' },
    });
    console.log('Category found:', category?.documentId);

    const tags = await app.documents('api::tag.tag').findMany({
      filters: {
        slug: {
          $in: [
            'strategic-finance',
            'digital-transformation',
            'financial-leadership',
            'business-strategy',
            'technology',
          ],
        },
      },
    });
    console.log('Tags found:', tags.map((t) => t.documentId));

    // Check if test article already exists
    const existing = await app.documents('api::article.article').findFirst({
      filters: { slug: 'future-of-strategic-financial-leadership' },
    });

    if (existing) {
      console.log('Existing article found, deleting old one to re-test:', existing.documentId);
      await app.documents('api::article.article').delete({
        documentId: existing.documentId,
      });
    }

    const testBlocks = [
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

    const articleData = {
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
      author: author?.documentId,
      category: category?.documentId,
      tags: tags.map((t) => t.documentId),
      blocks: testBlocks,
    };

    console.log('Creating article via Document Service...');
    const created = await app.documents('api::article.article').create({
      data: articleData,
      status: 'published',
    });

    console.log('Article created successfully!');
    console.log('ID:', created.id);
    console.log('Document ID:', created.documentId);
    console.log('Published At:', created.publishedAt);
    console.log('Blocks count:', created.blocks?.length);
  } catch (err) {
    console.error('Error creating article:', err);
  } finally {
    await app.destroy();
  }
}

testArticleCreation();


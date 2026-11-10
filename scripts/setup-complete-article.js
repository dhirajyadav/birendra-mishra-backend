const { createStrapi } = require('@strapi/strapi');
const path = require('path');

const richTextHtmlContent = `<h2>The Changing Landscape of Financial Leadership</h2>

<p>Modern financial leaders are rapidly moving beyond traditional backward-looking accounting and static financial reporting to become pivotal strategic business partners. In an era marked by rapid market disruption and volatile global capital dynamics, executive finance leadership requires proactive business transformation, multi-horizon financial planning, data-driven decisions, and enterprise technology adoption to foster long-term value creation.</p>

<p>To effectively steer organizations through volatility, finance leaders must understand technology, business operations, customer behavior, and market dynamics. Siloed balance-sheet management is no longer sufficient; <strong>executive stewardship</strong> requires <em>cross-functional operational synthesis</em> and relentless capital discipline.</p>

<div class="article-highlight-box">
  <strong>Executive Takeaway:</strong> Modern CFOs do not just measure historical EBITDA; they actively architect organizational resilience by balancing liquidity buffers, growth investments, and strict fiduciary governance.
</div>

<h2>Why Strategic Financial Leadership Matters</h2>

<p>Finance is no longer just scorekeeping — it is active value creation. Strategic CFOs anticipate market headwinds, structure capital reserves before liquidity crises emerge, and translate strategic ambition into disciplined capital allocation.</p>

<blockquote class="article-quote-block">
  <p class="article-quote-text">“Strategic financial leadership is not about reporting history. It is about navigating uncertainty, allocating capital with precision, and architecting the future of the enterprise.”</p>
  <cite class="article-quote-cite">— Birendra Mishra, Strategic Financial Advisory</cite>
</blockquote>

<h3>Core Pillars of Enterprise Transformation</h3>

<p>Executive priorities for driving high-velocity capital deployment across international operating entities:</p>

<ul>
  <li><strong>Capital Allocation Agility:</strong> Dynamically deploying capital to high-yield initiatives while maintaining balance-sheet liquidity.</li>
  <li><strong>Enterprise Risk Management:</strong> Mitigating cross-border currency, geopolitical, and operational exposures.</li>
  <li><strong>Digital &amp; AI Transformation:</strong> Automating core reconciliations to empower finance teams with predictive scenario modeling.</li>
  <li><strong>Fiduciary Governance:</strong> Institutionalizing audit-readiness across multi-jurisdictional operating subsidiaries.</li>
</ul>

<ol>
  <li>Establish a unified enterprise data architecture and single source of truth.</li>
  <li>Align finance metrics with commercial and operational business units.</li>
  <li>Invest in predictive financial intelligence and scenario planning models.</li>
  <li>Strengthen board-level governance and transparent stakeholder reporting.</li>
</ol>

<figure class="article-figure">
  <img src="/assets/oil-platforms.jpg" alt="Global energy infrastructure and capital governance operations" />
  <figcaption class="article-figcaption">Capital allocation and disciplined financial oversight across international operating infrastructure.</figcaption>
</figure>

<h3>Performance Metrics: Traditional vs. Strategic Finance</h3>

<div class="article-table-wrap">
  <table class="article-table">
    <thead>
      <tr>
        <th>Strategic Dimension</th>
        <th>Traditional Accounting</th>
        <th>Strategic Financial Leadership</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Decision Velocity</strong></td>
        <td>Monthly / Quarterly lag</td>
        <td>Real-time continuous scenario modeling</td>
      </tr>
      <tr>
        <td><strong>Technology Role</strong></td>
        <td>Siloed ERP &amp; manual spreadsheets</td>
        <td>Cloud data lakes &amp; AI-assisted forecasting</td>
      </tr>
      <tr>
        <td><strong>Fiduciary Governance</strong></td>
        <td>Annual compliance audit</td>
        <td>Continuous audit-readiness &amp; risk hedging</td>
      </tr>
      <tr>
        <td><strong>Enterprise Value</strong></td>
        <td>Cost containment focus</td>
        <td>Active ROI generation &amp; portfolio optimization</td>
      </tr>
    </tbody>
  </table>
</div>

<p>For more detailed research, explore our perspectives on <a href="/insights" target="_blank" rel="noopener noreferrer">global energy economics and capital governance</a>.</p>

<div class="article-embed-responsive">
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Executive Perspectives on Strategic Finance" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<div class="article-download-card">
  <div class="article-download-info">
    <div class="pdf-icon-box">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    </div>
    <div>
      <div class="pdf-title">Strategic Financial Leadership Executive Framework (PDF)</div>
      <div class="pdf-meta">Executive Whitepaper · 1.8 MB · Published by Birendra Mishra</div>
    </div>
  </div>
  <a class="btn btn-outline" href="/assets/og-image.svg" download="Executive-Framework.pdf">
    <span>Download PDF</span>
    <span style="margin-left: 0.4rem;">↓</span>
  </a>
</div>

<div class="article-btn-wrap">
  <a class="btn btn-primary" href="/#contact">
    <span>Explore Advisory Services</span>
    <span style="margin-left: 0.4rem;">↗</span>
  </a>
</div>`;

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

async function main() {
  console.log('[1/4] Bootstrapping Strapi...');
  const app = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  }).load();
  global.strapi = app;

  try {
    console.log('[2/4] Ensuring Author, Category, and Tags exist...');
    
    // Author
    let author = await app.documents('api::author.author').findFirst({
      filters: { name: 'Birendra Mishra' },
    });
    if (!author) {
      author = await app.documents('api::author.author').create({
        data: {
          name: 'Birendra Mishra',
          role: 'Senior Executive | Global Financial Strategy, M&A and Capital Governance',
          bio: 'Over two decades across international corporate headquarters and complex upstream energy operations in India, Nigeria, Italy, Kenya, South Africa, and Iraq.',
        },
        status: 'published',
      });
    }

    // Category
    let category = await app.documents('api::category.category').findFirst({
      filters: { slug: 'leadership' },
    });
    if (!category) {
      category = await app.documents('api::category.category').create({
        data: {
          name: 'Leadership',
          slug: 'leadership',
          description: 'Strategic leadership, governance and executive management insights.',
        },
        status: 'published',
      });
    }

    // Tags
    const tagDefs = [
      { name: 'Strategic Finance', slug: 'strategic-finance' },
      { name: 'Digital Transformation', slug: 'digital-transformation' },
      { name: 'Financial Leadership', slug: 'financial-leadership' },
      { name: 'Business Strategy', slug: 'business-strategy' },
      { name: 'Technology', slug: 'technology' },
    ];
    const tagDocIds = [];
    for (const td of tagDefs) {
      let t = await app.documents('api::tag.tag').findFirst({
        filters: { slug: td.slug },
      });
      if (!t) {
        t = await app.documents('api::tag.tag').create({
          data: td,
          status: 'published',
        });
      }
      tagDocIds.push(t.documentId);
    }

    console.log('[3/4] Creating/Updating Dummy Test Article...');
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
      content: richTextHtmlContent,
      blocks: testBlocks,
    };

    let resultDoc;
    if (existing) {
      resultDoc = await app.documents('api::article.article').update({
        documentId: existing.documentId,
        data: articlePayload,
        status: 'published',
      });
      console.log('✓ Existing dummy article updated with both CKEditor content & Dynamic Zone blocks!');
    } else {
      resultDoc = await app.documents('api::article.article').create({
        data: articlePayload,
        status: 'published',
      });
      console.log('✓ New dummy article created with both CKEditor content & Dynamic Zone blocks!');
    }

    console.log('[4/4] Verification Summary:');
    console.log('   - Title:', resultDoc.title);
    console.log('   - Slug:', resultDoc.slug);
    console.log('   - Document ID:', resultDoc.documentId);
    console.log('   - Author:', author.name);
    console.log('   - Category:', category.name);
    console.log('   - Tags count:', tagDocIds.length);
    console.log('   - Content length:', resultDoc.content?.length, 'characters');
    console.log('   - Blocks count:', resultDoc.blocks?.length);
    console.log('✓ Done!');
  } finally {
    await app.destroy();
  }
}

main().catch((err) => {
  console.error('Setup error:', err);
  process.exit(1);
});


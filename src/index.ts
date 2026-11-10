export default {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }: { strapi: any }) {
    try {
      // 1. Grant public permissions to view published content and submit enquiries
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const publicPermissions = [
          'api::global.global.find',
          'api::page.page.find',
          'api::page.page.findOne',
          'api::article.article.find',
          'api::article.article.findOne',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::tag.tag.find',
          'api::tag.tag.findOne',
          'api::author.author.find',
          'api::author.author.findOne',
          'api::enquiry.enquiry.create',
          'api::homepage.homepage.find',
          'api::linkedin.linkedin.getStatus',
          'api::linkedin.linkedin.getQueue',
          'api::linkedin.linkedin.getAuthUrl',
        ];

        for (const action of publicPermissions) {
          const existing = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({ where: { role: publicRole.id, action } });

          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
        strapi.log.info('✓ Public API permissions successfully configured for Headless frontend.');
      }

      // 2. Seed Global Settings if empty
      const existingGlobal = await strapi.db.query('api::global.global').findOne();
      if (!existingGlobal) {
        await strapi.db.query('api::global.global').create({
          data: {
            siteName: 'Birendra Mishra',
            siteTagline: 'Strategic Financial Leadership',
            ownerName: 'Birendra Mishra',
            ownerTitle: 'Senior Executive | Global Financial Strategy, M&A and Capital Governance',
            contactEmail: 'bbm@birendramishra.com',
            linkedInUrl: 'https://www.linkedin.com/',
            xUrl: 'https://x.com/',
            substackUrl: 'https://substack.com/',
            copyrightText:
              '© Birendra Mishra. All rights reserved. Personal views expressed here are independent and do not necessarily represent those of any employer or client or others.',
            publishedAt: new Date(),
          },
        });
        strapi.log.info('✓ Global settings seeded.');
      }

      // 3. Seed Author if empty
      const authors = await strapi.db.query('api::author.author').findMany();
      let authorId: number | null = null;
      if (!authors || authors.length === 0) {
        const author = await strapi.db.query('api::author.author').create({
          data: {
            name: 'Birendra Mishra',
            role: 'Senior Executive | Global Financial Strategy, M&A and Capital Governance',
            bio: 'Over two decades across international corporate headquarters and complex upstream energy operations in India, Nigeria, Italy, Kenya, South Africa, and Iraq.',
            publishedAt: new Date(),
          },
        });
        authorId = author.id;
        strapi.log.info('✓ Author seeded.');
      } else {
        authorId = authors[0].id;
      }

      // 4. Seed Categories if empty
      const categories = await strapi.db.query('api::category.category').findMany();
      let cat1Id: number | null = null;
      let cat2Id: number | null = null;
      let cat3Id: number | null = null;

      if (!categories || categories.length === 0) {
        const c1 = await strapi.db.query('api::category.category').create({
          data: { name: 'Markets & Geopolitics', slug: 'markets-geopolitics', publishedAt: new Date() },
        });
        const c2 = await strapi.db.query('api::category.category').create({
          data: { name: 'Finance & Investment', slug: 'finance-investment', publishedAt: new Date() },
        });
        const c3 = await strapi.db.query('api::category.category').create({
          data: { name: 'Energy · Technology · Leadership', slug: 'energy-tech-leadership', publishedAt: new Date() },
        });
        cat1Id = c1.id;
        cat2Id = c2.id;
        cat3Id = c3.id;
        strapi.log.info('✓ Categories seeded.');
      }

      // Ensure Leadership category exists
      let leadershipCat = await strapi.db.query('api::category.category').findOne({ where: { slug: 'leadership' } });
      if (!leadershipCat) {
        leadershipCat = await strapi.db.query('api::category.category').create({
          data: {
            name: 'Leadership',
            slug: 'leadership',
            description: 'Strategic leadership, governance and executive management insights.',
            publishedAt: new Date(),
          },
        });
      }

      // Ensure Tags exist
      const requiredTags = [
        { name: 'Strategic Finance', slug: 'strategic-finance' },
        { name: 'Digital Transformation', slug: 'digital-transformation' },
        { name: 'Financial Leadership', slug: 'financial-leadership' },
        { name: 'Business Strategy', slug: 'business-strategy' },
        { name: 'Technology', slug: 'technology' },
      ];
      for (const t of requiredTags) {
        const existingTag = await strapi.db.query('api::tag.tag').findOne({ where: { slug: t.slug } });
        if (!existingTag) {
          await strapi.db.query('api::tag.tag').create({
            data: { ...t, publishedAt: new Date() },
          });
        }
      }

      // 5. Seed Articles if empty
      const articles = await strapi.db.query('api::article.article').findMany();
      if (!articles || articles.length === 0) {
        await strapi.db.query('api::article.article').create({
          data: {
            title: 'From headline to financial consequence',
            slug: 'from-headline-to-financial-consequence',
            shortDescription:
              'Examining how geopolitical events, supply shifts and market structures translate into financial and strategic decisions.',
            excerpt:
              'Examining how geopolitical events, supply shifts and market structures translate into financial and strategic decisions.',
            readingTime: '5 min read',
            featuredArticle: true,
            publishedAt: new Date(),
            author: authorId,
            category: cat1Id || 1,
            linkedInPublishStatus: 'published',
            linkedInPostUrl: 'https://www.linkedin.com/',
          },
        });

        await strapi.db.query('api::article.article').create({
          data: {
            title: 'Capital through a CFO lens',
            slug: 'capital-through-a-cfo-lens',
            shortDescription:
              'Connecting energy-market developments with investment discipline, cash flow, portfolio choices and enterprise value.',
            excerpt:
              'Connecting energy-market developments with investment discipline, cash flow, portfolio choices and enterprise value.',
            readingTime: '6 min read',
            publishedAt: new Date(),
            author: authorId,
            category: cat2Id || 2,
            linkedInPublishStatus: 'published',
            linkedInPostUrl: 'https://www.linkedin.com/',
          },
        });

        await strapi.db.query('api::article.article').create({
          data: {
            title: 'Strategy beyond the numbers',
            slug: 'strategy-beyond-the-numbers',
            shortDescription:
              'Perspectives on transition, AI, organisational leadership and the decisions shaping the future of the energy business.',
            excerpt:
              'Perspectives on transition, AI, organisational leadership and the decisions shaping the future of the energy business.',
            readingTime: '7 min read',
            publishedAt: new Date(),
            author: authorId,
            category: cat3Id || 3,
            linkedInPublishStatus: 'published',
            linkedInPostUrl: 'https://www.linkedin.com/',
          },
        });
        strapi.log.info('✓ Articles seeded.');
      }

      // Ensure Master Dummy Test Article exists
      const testArticle = await strapi.db.query('api::article.article').findOne({
        where: { slug: 'future-of-strategic-financial-leadership' },
      });
      if (!testArticle) {
        const dummyContent = `<h2>The Changing Landscape of Financial Leadership</h2>

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

        await strapi.db.query('api::article.article').create({
          data: {
            title: 'The Future of Strategic Financial Leadership: Technology, Innovation & Business Growth',
            slug: 'future-of-strategic-financial-leadership',
            excerpt:
              'Explore how modern financial leadership, digital transformation, data-driven decision-making and emerging technologies are reshaping the future of business growth.',
            shortDescription:
              'A practical exploration of the evolving role of strategic financial leaders in a technology-driven business environment.',
            readingTime: '8 minutes',
            featuredArticle: true,
            publishedAt: new Date(),
            author: authorId,
            category: leadershipCat?.id,
            content: dummyContent,
            seoTitle: 'The Future of Strategic Financial Leadership | Birendra Mishra',
            seoDescription:
              'Discover how strategic financial leadership, technology, data analytics and digital transformation drive sustainable business growth.',
          },
        });
        strapi.log.info('✓ Master dummy article seeded.');
      }

      // 6. Enforce Clean 2-Section Content Manager Layout (hide blocks)
      try {
        const key = 'plugin_content_manager_configuration_content_types::api::article.article';
        const storeSetting = await strapi.db.query('strapi::core-store').findOne({ where: { key } });
        if (storeSetting && storeSetting.value) {
          const config = JSON.parse(storeSetting.value);
          config.layouts.edit = [
            // SECTION 1: ARTICLE CONTENT & DETAILS
            [
              { name: 'title', size: 6 },
              { name: 'slug', size: 6 },
            ],
            [
              { name: 'excerpt', size: 6 },
              { name: 'shortDescription', size: 6 },
            ],
            [
              { name: 'author', size: 6 },
              { name: 'category', size: 6 },
            ],
            [
              { name: 'featuredImage', size: 6 },
              { name: 'thumbnailImage', size: 6 },
            ],
            [
              { name: 'readingTime', size: 6 },
              { name: 'featuredArticle', size: 6 },
            ],
            [
              { name: 'content', size: 12 },
            ],

            // SECTION 2: SEO SETTINGS & TAGS
            [
              { name: 'tags', size: 12 },
            ],
            [
              { name: 'seoTitle', size: 6 },
              { name: 'canonicalUrl', size: 6 },
            ],
            [
              { name: 'seoDescription', size: 12 },
            ],
            [
              { name: 'seoKeywords', size: 6 },
              { name: 'openGraphImage', size: 6 },
            ],
            [
              { name: 'linkedInPublishStatus', size: 6 },
              { name: 'scheduledPublishAt', size: 6 },
            ],
            [
              { name: 'linkedInCaption', size: 12 },
            ],
            [
              { name: 'linkedInPostUrl', size: 12 },
            ],
          ];

          if (!config.metadatas) config.metadatas = {};
          config.metadatas.content = {
            edit: {
              label: 'Article Body (Rich Text Editor — Text, Images & Videos)',
              description: 'Write your full article here. Format text, insert media library images, embed videos, add tables, quotes, and links in one unified editor.',
              placeholder: 'Start writing your article...',
              visible: true,
              editable: true,
            },
            list: {
              label: 'Content',
              searchable: false,
              sortable: false,
            },
          };

          if (config.metadatas.blocks) {
            config.metadatas.blocks.edit = {
              ...config.metadatas.blocks.edit,
              visible: false,
            };
          }

          await strapi.db.query('strapi::core-store').update({
            where: { id: storeSetting.id },
            data: { value: JSON.stringify(config) },
          });
          strapi.log.info('✓ Content Manager Article edit view configured with 2 clean sections.');
        }
      } catch (cmErr: any) {
        strapi.log.debug(`Content Manager layout update notice: ${cmErr.message}`);
      }

      // 7. Seed/Enrich Homepage Single Type if empty or partially empty
      try {
        let existingHomepage = null;
        try {
          existingHomepage = await strapi.documents('api::homepage.homepage').findFirst({
            populate: '*',
          });
        } catch {
          existingHomepage = await strapi.entityService.findMany('api::homepage.homepage', {
            populate: '*',
          });
        }

        const initialHomepageData = require('./data/initial-homepage.json');

        if (!existingHomepage) {
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
          strapi.log.info('✓ Homepage Single Type created with complete finalized content.');
        } else if (!existingHomepage.meetBirendra || !existingHomepage.advisory || !existingHomepage.capabilities) {
          strapi.log.info('Homepage exists but sections are blank. Enriching all 10 sections with initial content...');
          const docId = existingHomepage.documentId || existingHomepage.id;

          const mergedHero = {
            ...initialHomepageData.hero,
            ...(existingHomepage.hero || {}),
          };

          if (strapi.documents) {
            await strapi.documents('api::homepage.homepage').update({
              documentId: docId,
              data: {
                ...initialHomepageData,
                hero: mergedHero,
              },
              status: 'published',
            });
          } else {
            await strapi.entityService.update('api::homepage.homepage', existingHomepage.id, {
              data: {
                ...initialHomepageData,
                hero: mergedHero,
                publishedAt: new Date(),
              },
            });
          }
          strapi.log.info('✓ Homepage Single Type successfully populated with all 10 sections & SEO data!');
        }
      } catch (hpErr: any) {
        strapi.log.warn(`Homepage seeding notice: ${hpErr.message}`);
      }
    } catch (err: any) {
      strapi.log.error(`[Strapi Bootstrap Warning]: ${err.message}`);
    }
  },
};

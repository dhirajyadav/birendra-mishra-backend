/**
 * Script: update-test-article-rich-content.js
 * Populates the new CKEditor 5 continuous Rich Text `content` field
 * while preserving the legacy Dynamic Zone `blocks`.
 */

const path = require('path');
const { createStrapi } = require('@strapi/strapi');

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

async function main() {
  console.log('[1/3] Bootstrapping Strapi...');
  const app = await createStrapi({
    appDir: path.resolve(__dirname, '..'),
    distDir: path.resolve(__dirname, '../dist'),
  }).load();
  global.strapi = app;

  try {
    console.log('[2/3] Finding test article...');
    const article = await app.documents('api::article.article').findFirst({
      filters: { slug: 'future-of-strategic-financial-leadership' },
    });

    if (!article) {
      console.error('Test article not found!');
      process.exit(1);
    }

    console.log('[3/3] Updating article with rich text content (CKEditor 5)...');
    const updated = await app.documents('api::article.article').update({
      documentId: article.documentId,
      data: {
        content: richTextHtmlContent,
      },
      status: 'published',
    });

    console.log('✓ Article updated successfully!');
    console.log('Document ID:', updated.documentId);
    console.log('Content length:', updated.content?.length, 'characters');
    console.log('Blocks preserved:', updated.blocks?.length || 'preserved in DB');

    process.exit(0);
  } catch (err) {
    console.error('Error updating article:', err);
    process.exit(1);
  }
}

main();


const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../.tmp/data.db');
const db = new Database(dbPath);

const row = db.prepare('SELECT content FROM articles WHERE slug = ?').get('future-of-strategic-financial-leadership');
if (row) {
  let content = row.content;

  // 1. Clean test headers & artifacts
  content = content.replace(/The Changing Landscape of Financial Leadership[^\n<]*/g, 'The Changing Landscape of Financial Leadership');
  content = content.replace(/<p><br>Align finance metrics with commercial and operational business units\.<\/p>/g, '');
  content = content.replace(/<p><a href="\/assets\/og-image\.svg">test<\/a><\/p>/g, '');

  // 2. Wrap table properly
  if (content.includes('<figure class="table"><table>')) {
    content = content.replace(/<figure class="table">\s*<table>/g, '<div class="article-table-wrap"><table class="article-table">');
    content = content.replace(/<\/table>\s*<\/figure>/g, '</table></div>');
  }

  // 3. Link with target="_blank"
  content = content.replace(
    '<a href="/insights">global energy economics and capital governance</a>',
    '<a href="/insights" target="_blank" rel="noopener noreferrer">global energy economics and capital governance</a>'
  );

  // 4. Ensure Callout Box
  if (!content.includes('article-highlight-box')) {
    content = content.replace(
      /<p>\s*<strong>Executive Takeaway:<\/strong>([\s\S]*?)<\/p>/i,
      '<div class="article-highlight-box"><strong>Executive Takeaway:</strong>$1</div>'
    );
  }

  // 5. Structure bottom elements cleanly
  const executiveElements = `
<div class="article-embed-responsive">
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Executive Perspectives on Strategic Finance" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
</div>

<div class="article-download-card">
  <div class="article-download-info">
    <div class="pdf-icon-box">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  <a class="btn btn-primary executive-article-cta" href="/#contact">
    <span>Explore Advisory Services</span>
    <span class="cta-arrow" style="margin-left: 0.4rem;">↗</span>
  </a>
</div>`;

  // Find the research link paragraph
  const researchLinkMarker = 'global energy economics and capital governance</a>.</p>';
  const idx = content.indexOf(researchLinkMarker);
  if (idx !== -1) {
    content = content.substring(0, idx + researchLinkMarker.length) + '\n\n' + executiveElements;
  } else {
    content += '\n\n' + executiveElements;
  }

  db.prepare('UPDATE articles SET content = ? WHERE slug = ?').run(content, 'future-of-strategic-financial-leadership');
  console.log('✓ Article content in SQLite database updated cleanly!');
}

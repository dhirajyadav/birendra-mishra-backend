const Database = require('../node_modules/better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../.tmp/data.db');
const db = new Database(dbPath);

function showColumns(table) {
  console.log(`\n=== Table: ${table} ===`);
  console.log(db.prepare(`PRAGMA table_info(${table})`).all());
}

showColumns('articles');
showColumns('articles_cmps');
showColumns('components_article_blocks_headings');
showColumns('components_article_blocks_paragraphs');
showColumns('components_article_blocks_quotes');
showColumns('components_article_blocks_cta_buttons');
showColumns('articles_author_lnk');
showColumns('articles_category_lnk');
showColumns('articles_tags_lnk');
showColumns('tags');

console.log('\n=== Existing articles_cmps entries ===');
console.log(db.prepare('SELECT * FROM articles_cmps').all());

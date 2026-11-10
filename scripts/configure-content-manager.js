const Database = require('../node_modules/better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../.tmp/data.db');
const db = new Database(dbPath);

const key = 'plugin_content_manager_configuration_content_types::api::article.article';
const row = db.prepare('SELECT value FROM strapi_core_store_settings WHERE key = ?').get(key);

if (row) {
  const config = JSON.parse(row.value);

  // Clean 2-Section Edit Layout (Blocks completely removed)
  config.layouts.edit = [
    // ==========================================
    // SECTION 1: ARTICLE DETAILS & WYSIWYG EDITOR
    // ==========================================
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

    // ==========================================
    // SECTION 2: SEO SETTINGS & TAGS
    // ==========================================
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

  // Configure metadata labels & descriptions for optimal UX
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

  config.metadatas.tags = {
    edit: {
      label: 'Article Tags (SEO & Topic Taxonomy)',
      description: 'Select or add strategic tags for categorization, search, and SEO indexing.',
      visible: true,
      editable: true,
    },
    list: {
      label: 'Tags',
      searchable: true,
      sortable: false,
    },
  };

  // Explicitly hide blocks from Content Manager edit view
  if (config.metadatas.blocks) {
    config.metadatas.blocks.edit = {
      ...config.metadatas.blocks.edit,
      visible: false,
    };
  }

  // Save back to DB
  db.prepare('UPDATE strapi_core_store_settings SET value = ? WHERE key = ?').run(
    JSON.stringify(config),
    key
  );
  console.log('✓ Successfully reorganized Article editor into 2 clean sections and removed blocks from the UI!');
} else {
  console.log('Warning: No content manager config found for Article.');
}

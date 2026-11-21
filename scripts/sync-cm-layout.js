const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('c:/Users/dhira/Desktop/old-html/backend/.tmp/data.db');
const row = db.prepare("SELECT value FROM strapi_core_store_settings WHERE key = 'plugin_content_manager_configuration_content_types::api::article.article'").get();
if (row) {
  const conf = JSON.parse(row.value);
  // Rebuild edit layout cleanly
  const editLayout = conf.layouts.edit.filter(r => !r.some(c => c.name === 'linkedInHashtags'));
  const captionIdx = editLayout.findIndex(r => r.some(c => c.name === 'linkedInCaption'));
  if (captionIdx !== -1) {
    editLayout.splice(captionIdx + 1, 0, [{ name: 'linkedInHashtags', size: 12 }]);
  } else {
    editLayout.push([{ name: 'linkedInHashtags', size: 12 }]);
  }
  conf.layouts.edit = editLayout;

  if (!conf.metadatas) conf.metadatas = {};
  conf.metadatas.linkedInHashtags = {
    edit: {
      label: 'LinkedIn #Hashtags (Optional)',
      description: 'Custom #hashtags for LinkedIn post (e.g. #leadership #energy #strategy #RACIE). If left empty, automatically generated from article topics & keywords.',
      placeholder: '#leadership #energy #strategy #theEnergyPerspective',
      visible: true,
      editable: true,
    },
    list: {
      label: 'LinkedIn Hashtags',
      searchable: true,
      sortable: false,
    },
  };

  db.prepare("UPDATE strapi_core_store_settings SET value = ? WHERE key = 'plugin_content_manager_configuration_content_types::api::article.article'").run(JSON.stringify(conf));
  console.log('✓ SQLite DB updated with linkedInHashtags in edit layout.');
} else {
  console.log('Key not found.');
}

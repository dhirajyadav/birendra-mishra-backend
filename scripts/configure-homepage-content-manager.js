const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../.tmp/data.db');
const db = new Database(dbPath);

const key = 'plugin_content_manager_configuration_content_types::api::homepage.homepage';
const existingRow = db.prepare('SELECT id, value FROM strapi_core_store_settings WHERE key = ?').get(key);

const config = {
  settings: {
    bulkable: false,
    filterable: false,
    searchable: false,
    pageSize: 10,
    mainField: 'id',
    defaultSortBy: 'id',
    defaultSortOrder: 'ASC',
  },
  layouts: {
    edit: [
      [{ name: 'hero', size: 12 }],
      [{ name: 'pillars', size: 12 }],
      [{ name: 'meetBirendra', size: 12 }],
      [{ name: 'purposeMissionValues', size: 12 }],
      [{ name: 'aspiration', size: 12 }],
      [{ name: 'capabilities', size: 12 }],
      [{ name: 'insights', size: 12 }],
      [{ name: 'advisory', size: 12 }],
      [{ name: 'faq', size: 12 }],
      [{ name: 'contact', size: 12 }],
      [{ name: 'seoTitle', size: 6 }, { name: 'seoDescription', size: 6 }],
    ],
    list: ['id', 'updatedAt'],
  },
  metadatas: {
    hero: {
      edit: {
        label: '1. Hero Section',
        description: 'Edit main title, highlight, description, CTA button, glance card metrics, and trust credentials.',
        visible: true,
        editable: true,
      },
    },
    pillars: {
      edit: {
        label: '2. Four Pillars Section',
        description: 'Edit the 4 core value proposition pillars below the hero.',
        visible: true,
        editable: true,
      },
    },
    meetBirendra: {
      edit: {
        label: '3. Meet Birendra (Executive Profile)',
        description: 'Executive bio, credentials, metrics, 5 strategic capabilities, and executive philosophy quote.',
        visible: true,
        editable: true,
      },
    },
    purposeMissionValues: {
      edit: {
        label: '4. Purpose, Mission & Values',
        description: 'Foundational principles for purpose, mission, and professional standards.',
        visible: true,
        editable: true,
      },
    },
    aspiration: {
      edit: {
        label: '5. Aspiration Section',
        description: 'Strategic vision quote, and the 3 aspiration pillars (Intelligence, Agility, Stewardship).',
        visible: true,
        editable: true,
      },
    },
    capabilities: {
      edit: {
        label: '6. Capabilities (Four Strategic Pillars)',
        description: 'Detailed cards for M&A, AI in Finance, Capital Allocation & Governance, Risk & Controls.',
        visible: true,
        editable: true,
      },
    },
    insights: {
      edit: {
        label: '7. Insights Section Header',
        description: 'Heading, subheadings, lead text, and LinkedIn link for the insights section.',
        visible: true,
        editable: true,
      },
    },
    advisory: {
      edit: {
        label: '8. Advisory Section',
        description: 'Selective advisory brief, executive CTA, and the 5 practice areas.',
        visible: true,
        editable: true,
      },
    },
    faq: {
      edit: {
        label: '9. FAQ Section (Optional)',
        description: 'Common questions & answers. Can be toggled visible/hidden via isVisible switch.',
        visible: true,
        editable: true,
      },
    },
    contact: {
      edit: {
        label: '10. Contact / Enquiry Section',
        description: 'Executive connect copy, profile details, LinkedIn link, and enquiry form field labels.',
        visible: true,
        editable: true,
      },
    },
    seoTitle: {
      edit: {
        label: 'SEO Meta Title',
        visible: true,
        editable: true,
      },
    },
    seoDescription: {
      edit: {
        label: 'SEO Meta Description',
        visible: true,
        editable: true,
      },
    },
  },
};

const jsonValue = JSON.stringify(config);

if (existingRow) {
  db.prepare('UPDATE strapi_core_store_settings SET value = ? WHERE id = ?').run(jsonValue, existingRow.id);
  console.log('✓ Updated existing Homepage Content Manager layout.');
} else {
  db.prepare('INSERT INTO strapi_core_store_settings (key, value, type, environment, tag) VALUES (?, ?, ?, ?, ?)').run(
    key,
    jsonValue,
    'object',
    null,
    null
  );
  console.log('✓ Inserted Homepage Content Manager layout.');
}

db.close();


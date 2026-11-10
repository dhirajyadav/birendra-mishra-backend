'use strict';

const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../patches/ckeditor');
const destDir = path.resolve(__dirname, '../node_modules/@ckeditor/strapi-plugin-ckeditor');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const sp = path.join(src, entry.name);
    const dp = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sp, dp);
    } else {
      fs.copyFileSync(sp, dp);
    }
  }
}

try {
  if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, destDir);
    console.log('✓ Successfully applied custom CKEditor 5 modern document editor patches to node_modules');
  }
} catch (err) {
  console.warn('Notice: patch-ckeditor could not complete:', err.message);
}


'use strict';

const path = require('path');
const fs = require('fs');

const appDir = __dirname;
const distDir = path.join(appDir, 'dist');

// Ensure runtime directories exist (especially for fresh git clones)
const tmpDir = path.join(appDir, '.tmp');
if (!fs.existsSync(tmpDir)) {
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
  } catch (e) {}
}

const uploadsDir = path.join(appDir, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {}
}

// Persistent upload storage across Hostinger deployments
try {
  let domainDir = null;
  if (appDir.includes('hbuilds')) {
    domainDir = path.resolve(appDir.split('hbuilds')[0]);
  } else if (appDir.includes('domains')) {
    const parts = appDir.split(path.sep);
    const domainIdx = parts.findIndex(p => p === 'domains');
    if (domainIdx !== -1 && parts[domainIdx + 1]) {
      domainDir = parts.slice(0, domainIdx + 2).join(path.sep);
    }
  }

  if (domainDir && fs.existsSync(domainDir)) {
    const sharedUploads = path.join(domainDir, 'shared_uploads');
    if (!fs.existsSync(sharedUploads)) {
      fs.mkdirSync(sharedUploads, { recursive: true });
    }

    // 1. Copy seed/git files to sharedUploads if not already present
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const f of files) {
        if (f === '.gitkeep') continue;
        const src = path.join(uploadsDir, f);
        const dst = path.join(sharedUploads, f);
        if (!fs.existsSync(dst)) {
          try { fs.copyFileSync(src, dst); } catch (e) {}
        }
      }
    }

    // 2. Copy all persisted uploads from sharedUploads to current uploadsDir
    const sharedFiles = fs.readdirSync(sharedUploads);
    for (const f of sharedFiles) {
      const src = path.join(sharedUploads, f);
      const dst = path.join(uploadsDir, f);
      if (!fs.existsSync(dst)) {
        try { fs.copyFileSync(src, dst); } catch (e) {}
      }
    }
    console.log(`[Hostinger Storage] Synced ${sharedFiles.length} uploads between ${uploadsDir} and ${sharedUploads}`);

    // 3. Watch uploadsDir for newly uploaded files in Strapi admin and sync to sharedUploads
    try {
      fs.watch(uploadsDir, (eventType, filename) => {
        if (!filename || filename.startsWith('.')) return;
        const src = path.join(uploadsDir, filename);
        const dst = path.join(sharedUploads, filename);
        if (fs.existsSync(src)) {
          try { fs.copyFileSync(src, dst); } catch (e) {}
        }
      });
    } catch (e) {}
  }
} catch (err) {
  console.warn('[Hostinger Storage] Sync skipped:', err.message);
}

// In production, Strapi 5 uses the compiled dist directory
const hasDist = fs.existsSync(distDir);

const strapi = require('@strapi/strapi');

const app = typeof strapi.createStrapi === 'function'
  ? strapi.createStrapi({ appDir, distDir: hasDist ? distDir : appDir })
  : strapi({ appDir, distDir: hasDist ? distDir : appDir });

// Start the Strapi HTTP server immediately
app.start();


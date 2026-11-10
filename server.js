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

// In production, Strapi 5 uses the compiled dist directory
const hasDist = fs.existsSync(distDir);

const strapi = require('@strapi/strapi');

const app = typeof strapi.createStrapi === 'function'
  ? strapi.createStrapi({ appDir, distDir: hasDist ? distDir : appDir })
  : strapi({ appDir, distDir: hasDist ? distDir : appDir });

// Start the Strapi HTTP server immediately
app.start();


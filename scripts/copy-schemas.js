const fs = require('fs');
const path = require('path');

function copyRecursive(srcDir, destDir, filterFn = () => true) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) {
    try {
      fs.mkdirSync(destDir, { recursive: true });
    } catch {}
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, filterFn);
    } else if (filterFn(entry.name)) {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        // Retry once on Windows file lock
        try {
          fs.copyFileSync(srcPath, destPath);
        } catch {}
      }
    }
  }
}

// 1. Copy JSON schemas & components
copyRecursive(
  path.resolve(__dirname, '../src'),
  path.resolve(__dirname, '../dist/src'),
  (name) => name.endsWith('.json')
);
console.log('✓ Schemas and components copied to dist');

// 2. Copy build assets if available
const buildDir = path.resolve(__dirname, '../build');
const distBuildDir = path.resolve(__dirname, '../dist/build');
const rootAdminBuildDir = path.resolve(__dirname, '../../node_modules/@strapi/admin/build');

if (fs.existsSync(distBuildDir) && fs.readdirSync(distBuildDir).length > 0) {
  copyRecursive(distBuildDir, buildDir);
  copyRecursive(distBuildDir, rootAdminBuildDir);
  console.log('✓ Admin build synced from dist/build to build and @strapi/admin/build');
} else if (fs.existsSync(buildDir) && fs.readdirSync(buildDir).length > 0) {
  copyRecursive(buildDir, distBuildDir);
  copyRecursive(buildDir, rootAdminBuildDir);
  console.log('✓ Admin build synced from build to dist/build and @strapi/admin/build');
}

// 2b. Copy public assets (including CKEditor 5 local bundle)
const publicDir = path.resolve(__dirname, '../public');
const distPublicDir = path.resolve(__dirname, '../dist/public');
if (fs.existsSync(publicDir)) {
  copyRecursive(publicDir, distPublicDir);
  console.log('✓ Public assets synced to dist/public');
}

// 3. Ensure favicon.ico is present
const rootFavicon = path.resolve(__dirname, '../favicon.ico');
if (fs.existsSync(rootFavicon)) {
  const distFavicon = path.resolve(__dirname, '../dist/favicon.ico');
  fs.copyFileSync(rootFavicon, distFavicon);
}

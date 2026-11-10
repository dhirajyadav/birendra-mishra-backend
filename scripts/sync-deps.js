const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../node_modules');
const destDir = path.resolve(__dirname, '../../node_modules');

if (fs.existsSync(srcDir)) {
  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    if (!fs.existsSync(destPath)) {
      console.log('Copying missing module to root node_modules:', entry);
      fs.cpSync(srcPath, destPath, { recursive: true, force: true });
    }
  }
}
console.log('✓ Modules synced');


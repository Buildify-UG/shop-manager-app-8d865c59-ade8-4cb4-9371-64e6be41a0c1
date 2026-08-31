#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const PROJECT_ROOT = '/project';
const OUTPUT_ZIP = '/project/shop-manager-app.zip';

console.log('\n📦 Creating Zip Archive...\n');

// Remove existing zip if it exists
if (fs.existsSync(OUTPUT_ZIP)) {
  fs.unlinkSync(OUTPUT_ZIP);
  console.log('✓ Removed existing zip file\n');
}

const output = fs.createWriteStream(OUTPUT_ZIP);
const archive = archiver('zip', { zlib: { level: 9 } });

const itemsToZip = [
  'dist',
  'src',
  'node_modules',
  'public',
  'lib',
  'plugins',
  'docs',
  'package.json',
  'package-lock.json',
  'index.html',
  'vite.config.ts',
  'vite.config.buildify.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json',
  'eslint.config.js',
  '.gitignore'
];

console.log('Adding files to archive:\n');

archive.on('error', (err) => {
  console.error('❌ Archive error:', err.message);
  process.exit(1);
});

output.on('close', () => {
  const stats = fs.statSync(OUTPUT_ZIP);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('\n✅ Zip file created successfully!\n');
  console.log('='.repeat(60));
  console.log('📦 BUILD SUMMARY');
  console.log('='.repeat(60));
  console.log(`📍 Location: ${OUTPUT_ZIP}`);
  console.log(`📊 Size: ${sizeInMB} MB`);
  console.log(`📦 Total bytes: ${stats.size.toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n✅ Ready for deployment!\n');
});

archive.pipe(output);

for (const item of itemsToZip) {
  const itemPath = path.join(PROJECT_ROOT, item);
  
  if (!fs.existsSync(itemPath)) {
    console.log(`⚠️  Skipping missing: ${item}`);
    continue;
  }
  
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    archive.directory(itemPath, item);
    console.log(`✓ Added directory: ${item}`);
  } else {
    archive.file(itemPath, { name: item });
    console.log(`✓ Added file: ${item}`);
  }
}

archive.finalize();

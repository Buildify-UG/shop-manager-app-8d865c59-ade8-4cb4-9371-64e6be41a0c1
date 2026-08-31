#!/usr/bin/env node

// Shop Manager App - Zip Creation
// This script creates a zip file of the entire project

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const projectRoot = '/project';
const outputZip = '/project/shop-manager-app.zip';

console.log('\n' + '='.repeat(70));
console.log('📦 SHOP MANAGER APP - ZIP CREATION');
console.log('='.repeat(70) + '\n');

// Remove existing zip
if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
  console.log('✓ Removed existing zip file\n');
}

// Create output stream and archiver
const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', { zlib: { level: 9 } });

// Items to zip
const items = [
  'dist', 'src', 'node_modules', 'public', 'lib', 'plugins', 'docs',
  'package.json', 'package-lock.json', 'index.html',
  'vite.config.ts', 'vite.config.buildify.ts',
  'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
  'tailwind.config.ts', 'postcss.config.js', 'components.json',
  'eslint.config.js', '.gitignore'
];

console.log('Adding files to archive:\n');

// Event handlers
archive.on('error', (err) => {
  console.error('\n❌ Archive error:', err.message);
  process.exit(1);
});

output.on('error', (err) => {
  console.error('\n❌ Output error:', err.message);
  process.exit(1);
});

output.on('close', () => {
  const stats = fs.statSync(outputZip);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ ZIP FILE CREATED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`\n📍 Location: ${outputZip}`);
  console.log(`📊 Size: ${sizeMB} MB (${stats.size.toLocaleString()} bytes)`);
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Ready for deployment!\n');
});

// Pipe archive to output
archive.pipe(output);

// Add files to archive
for (const item of items) {
  const itemPath = path.join(projectRoot, item);
  
  if (!fs.existsSync(itemPath)) {
    console.log(`  ⚠️  Skipping (not found): ${item}`);
    continue;
  }
  
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    archive.directory(itemPath, item);
    console.log(`  ✓ Added directory: ${item}/`);
  } else {
    archive.file(itemPath, { name: item });
    console.log(`  ✓ Added file: ${item}`);
  }
}

// Finalize archive
archive.finalize();

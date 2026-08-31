#!/usr/bin/env node
const archiver = require('archiver');
const fs = require('fs');

console.log('Creating zip file...');

const output = fs.createWriteStream('/project/shop-manager-app.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ SUCCESS! Zip file created.`);
  console.log(`📍 Location: /project/shop-manager-app.zip`);
  console.log(`📦 Size: ${(archive.pointer() / 1024).toFixed(2)} KB`);
  process.exit(0);
});

output.on('error', (err) => {
  console.error('❌ Output error:', err);
  process.exit(1);
});

archive.on('error', (err) => {
  console.error('❌ Archive error:', err);
  process.exit(1);
});

archive.pipe(output);
archive.directory('/project/dist/', 'dist');
archive.directory('/project/src/', 'src');
archive.file('/project/package.json', { name: 'package.json' });
archive.file('/project/index.html', { name: 'index.html' });
archive.finalize();

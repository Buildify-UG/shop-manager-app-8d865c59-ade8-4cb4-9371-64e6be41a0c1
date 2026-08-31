#!/usr/bin/env node

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const zipPath = path.join(__dirname, 'shop-manager-app.zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

// Listen for all archive data to be written
output.on('close', function() {
  const stats = fs.statSync(zipPath);
  console.log('\n✅ ZIP file created successfully!');
  console.log(`📦 File: ${zipPath}`);
  console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
  console.log('\n✨ The shop manager app has been successfully packaged!');
  process.exit(0);
});

// This event is fired when the data has been drained from the file
archive.on('drain', function() {
  console.log('Draining...');
});

// Good practice to catch warnings (ie stat failures and other non-fatal errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️ Warning:', err.message);
  } else {
    throw err;
  }
});

// Catch explicit errors
archive.on('error', function(err) {
  console.error('❌ Error creating zip file:', err.message);
  process.exit(1);
});

// Pipe archive data to the file
archive.pipe(output);

console.log('📝 Creating zip file: shop-manager-app.zip');
console.log('📂 Adding files...\n');

// Add directories and files
const filesToAdd = [
  { source: 'dist', dest: 'dist' },
  { source: 'src', dest: 'src' },
  { source: 'package.json', dest: 'package.json' },
  { source: 'index.html', dest: 'index.html' }
];

for (const item of filesToAdd) {
  const fullPath = path.join(__dirname, item.source);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      console.log(`  ✓ Adding directory: ${item.source}/`);
      archive.directory(fullPath, item.dest);
    } else {
      console.log(`  ✓ Adding file: ${item.source}`);
      archive.file(fullPath, { name: item.dest });
    }
  } else {
    console.log(`  ⚠️ Skipping (not found): ${item.source}`);
  }
}

// Finalize the archive (this is what triggers the writes and close event)
archive.finalize();

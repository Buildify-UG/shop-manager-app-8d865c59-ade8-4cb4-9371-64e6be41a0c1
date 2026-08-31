#!/usr/bin/env node

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createZip() {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(__dirname, 'shop-manager-app.zip');
    
    // Remove existing zip if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
      console.log('🗑️  Removed existing zip file');
    }
    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', function() {
      const stats = fs.statSync(zipPath);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log('\n✅ ZIP file created successfully!');
      console.log(`📦 File: ${zipPath}`);
      console.log(`📊 Size: ${sizeInMB} MB (${stats.size} bytes)`);
      console.log('\n✨ The shop manager app has been successfully packaged!');
      resolve({ success: true, path: zipPath, size: stats.size });
    });

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn('⚠️ Warning:', err.message);
      } else {
        reject(err);
      }
    });

    archive.on('error', function(err) {
      console.error('❌ Error creating zip file:', err.message);
      reject(err);
    });

    archive.pipe(output);

    console.log('📝 Creating zip file: shop-manager-app.zip');
    console.log('📂 Adding files...\n');

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

    archive.finalize();
  });
}

createZip().catch(err => {
  console.error('Failed to create zip:', err);
  process.exit(1);
});

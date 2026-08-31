#!/usr/bin/env node
/**
 * Shop Manager App - ZIP Builder
 * Creates a production-ready zip file with all necessary files
 */

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildZip() {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(__dirname, 'shop-manager-app.zip');
    
    // Clean up existing zip
    if (fs.existsSync(zipPath)) {
      try {
        fs.unlinkSync(zipPath);
        console.log('🗑️  Cleaned up existing zip file\n');
      } catch (e) {
        console.warn('⚠️  Could not remove existing zip:', e.message);
      }
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Handle successful completion
    output.on('close', () => {
      try {
        const stats = fs.statSync(zipPath);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
        const sizeInKB = (stats.size / 1024).toFixed(2);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ ZIP FILE CREATED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log(`\n📦 File: shop-manager-app.zip`);
        console.log(`📍 Location: ${zipPath}`);
        console.log(`📊 Size: ${sizeInMB} MB (${sizeInKB} KB, ${stats.size} bytes)`);
        console.log('\n📋 Contents included:');
        console.log('   ✓ dist/          - Production build');
        console.log('   ✓ src/           - Source code');
        console.log('   ✓ package.json   - Project configuration');
        console.log('   ✓ index.html     - Entry point');
        console.log('\n✨ Ready for deployment or distribution!');
        console.log('='.repeat(60) + '\n');
        
        resolve({ success: true, path: zipPath, size: stats.size });
      } catch (error) {
        console.error('❌ Error reading zip file stats:', error.message);
        reject(error);
      }
    });

    // Handle stream errors
    output.on('error', (err) => {
      console.error('❌ Output stream error:', err.message);
      reject(err);
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('❌ Archive error:', err.message);
      reject(err);
    });

    // Handle warnings
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(`⚠️  File not found (will be skipped): ${err.path}`);
      } else {
        console.warn('⚠️  Warning:', err.message);
      }
    });

    // Pipe archive to output stream
    archive.pipe(output);

    // Start adding files
    console.log('🚀 Building zip file...\n');
    console.log('📂 Adding contents:\n');

    const itemsToAdd = [
      {
        type: 'directory',
        source: 'dist',
        dest: 'dist',
        description: 'Production build'
      },
      {
        type: 'directory',
        source: 'src',
        dest: 'src',
        description: 'Source code'
      },
      {
        type: 'file',
        source: 'package.json',
        dest: 'package.json',
        description: 'Project dependencies'
      },
      {
        type: 'file',
        source: 'index.html',
        dest: 'index.html',
        description: 'HTML entry point'
      }
    ];

    let addedCount = 0;

    for (const item of itemsToAdd) {
      const fullPath = path.join(__dirname, item.source);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        
        if (item.type === 'directory' && stats.isDirectory()) {
          console.log(`   ✓ ${item.dest}/`);
          console.log(`     └─ ${item.description}`);
          archive.directory(fullPath, item.dest);
          addedCount++;
        } else if (item.type === 'file' && stats.isFile()) {
          const sizeKB = (stats.size / 1024).toFixed(2);
          console.log(`   ✓ ${item.dest} (${sizeKB} KB)`);
          console.log(`     └─ ${item.description}`);
          archive.file(fullPath, { name: item.dest });
          addedCount++;
        } else {
          console.log(`   ✗ ${item.source} (wrong type)`);
        }
      } else {
        console.log(`   ✗ ${item.source} (not found)`);
      }
    }

    console.log(`\n📦 Total items added: ${addedCount}/${itemsToAdd.length}\n`);

    // Finalize archive
    archive.finalize().catch(reject);
  });
}

// Execute
buildZip()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  });

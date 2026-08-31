#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const PROJECT_ROOT = '/project';
const OUTPUT_ZIP = '/project/shop-manager-app.zip';

async function main() {
  console.log('\n📦 Creating Production Zip File\n');
  console.log('='*60 + '\n');
  
  try {
    // Remove old zip
    if (fs.existsSync(OUTPUT_ZIP)) {
      fs.unlinkSync(OUTPUT_ZIP);
      console.log('✓ Removed existing zip file\n');
    }
    
    // Create zip using system zip command
    const items = [
      'dist', 'src', 'node_modules', 'public', 'lib', 'plugins', 'docs',
      'package.json', 'package-lock.json', 'index.html',
      'vite.config.ts', 'vite.config.buildify.ts',
      'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
      'tailwind.config.ts', 'postcss.config.js', 'components.json',
      'eslint.config.js', '.gitignore'
    ];
    
    const zipCmd = `cd ${PROJECT_ROOT} && zip -r -q shop-manager-app.zip ${items.join(' ')}`;
    
    console.log('Creating archive...\n');
    await exec(zipCmd);
    
    // Verify
    if (!fs.existsSync(OUTPUT_ZIP)) {
      throw new Error('Zip file was not created');
    }
    
    const stats = fs.statSync(OUTPUT_ZIP);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('='*60);
    console.log('\n✅ ZIP FILE CREATED SUCCESSFULLY\n');
    console.log('📍 Location: ' + OUTPUT_ZIP);
    console.log('📊 Size: ' + sizeMB + ' MB');
    console.log('📦 Bytes: ' + stats.size.toLocaleString());
    console.log('\n' + '='*60 + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  }
}

main();

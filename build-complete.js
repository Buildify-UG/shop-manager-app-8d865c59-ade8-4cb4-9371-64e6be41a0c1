#!/usr/bin/env node

/**
 * Complete Build & Compression Script
 * Handles: npm build + zip creation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd() === '/' ? '/project' : process.cwd();
const OUTPUT_ZIP = path.join(PROJECT_ROOT, 'shop-manager-app.zip');

function log(msg) { console.log(msg); }
function section(title) { log('\n' + '='.repeat(60) + '\n' + title + '\n' + '='.repeat(60)); }
function step(num, title) { log(`\n📋 Step ${num}: ${title}\n` + '-'.repeat(60)); }

section('🚀 Shop Manager App - Production Build');

// Step 1: Build
step(1, 'Creating Production Build');

try {
  log('\nRunning: npm run build\n');
  const output = execSync('npm run build', {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: 'inherit'
  });
  log('\n✅ Build completed successfully!');
} catch (error) {
  log('\n❌ Build failed!');
  log('Error: ' + error.message);
  process.exit(1);
}

// Step 2: Verify build
step(2, 'Verifying Build Output');

const distPath = path.join(PROJECT_ROOT, 'dist');
if (!fs.existsSync(distPath)) {
  log('❌ dist folder not found!');
  process.exit(1);
}

log(`✅ dist folder found and ready`);

// Step 3: Create zip
step(3, 'Creating Zip Archive');

if (fs.existsSync(OUTPUT_ZIP)) {
  fs.unlinkSync(OUTPUT_ZIP);
  log('Removed existing zip file\n');
}

try {
  const archiver = require('archiver');
  const output = fs.createWriteStream(OUTPUT_ZIP);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const items = [
    'dist', 'src', 'node_modules', 'public', 'lib', 'plugins', 'docs',
    'package.json', 'package-lock.json', 'index.html',
    'vite.config.ts', 'vite.config.buildify.ts',
    'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
    'tailwind.config.ts', 'postcss.config.js', 'components.json',
    'eslint.config.js', '.gitignore'
  ];

  log('Adding files:\n');

  archive.on('error', (err) => {
    log('❌ Error: ' + err.message);
    process.exit(1);
  });

  output.on('close', () => {
    const stats = fs.statSync(OUTPUT_ZIP);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    
    section('✅ BUILD COMPLETE');
    log(`📍 Location: ${OUTPUT_ZIP}`);
    log(`📊 Size: ${sizeInMB} MB (${stats.size.toLocaleString()} bytes)`);
    log('\n✅ Your production build is ready for deployment!\n');
  });

  archive.pipe(output);

  for (const item of items) {
    const itemPath = path.join(PROJECT_ROOT, item);
    if (!fs.existsSync(itemPath)) continue;
    
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      archive.directory(itemPath, item);
    } else {
      archive.file(itemPath, { name: item });
    }
    log(`✓ ${item}`);
  }

  archive.finalize();

} catch (error) {
  log('❌ Zip creation failed: ' + error.message);
  process.exit(1);
}

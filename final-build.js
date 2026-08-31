#!/usr/bin/env node

/**
 * Production Build & Compression Script
 * This script creates a production build and compresses the project into a zip file
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = '/project';
const OUTPUT_ZIP = path.join(PROJECT_ROOT, 'shop-manager-app.zip');

function log(message) {
  console.log(message);
}

function logSection(title) {
  log('\n' + '='.repeat(60));
  log(title);
  log('='.repeat(60));
}

function logStep(step, title) {
  log(`\n📋 Step ${step}: ${title}`);
  log('-'.repeat(60));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    });
  } catch (e) {
    // ignore
  }
  return size;
}

logSection('🚀 Shop Manager App - Production Build & Compression');

// Step 1: Build
logStep(1, 'Creating Production Build');

log('\nRunning: npm run build\n');

const buildResult = spawnSync('npm', ['run', 'build'], {
  cwd: PROJECT_ROOT,
  stdio: 'inherit',
  shell: true
});

if (buildResult.status !== 0) {
  log('\n❌ Build failed with exit code: ' + buildResult.status);
  process.exit(1);
}

log('\n✅ Build completed successfully!');

// Step 2: Verify build
logStep(2, 'Verifying Build Output');

const distPath = path.join(PROJECT_ROOT, 'dist');
if (!fs.existsSync(distPath)) {
  log('❌ dist folder not found after build!');
  process.exit(1);
}

const distSize = getDirectorySize(distPath);
log(`✅ dist folder verified (${formatBytes(distSize)})`);

// Step 3: Create zip using archiver
logStep(3, 'Creating Zip Archive');

if (fs.existsSync(OUTPUT_ZIP)) {
  fs.unlinkSync(OUTPUT_ZIP);
  log('Removed existing zip file');
}

try {
  const archiver = require('archiver');
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

  log('\nAdding files to archive:\n');

  archive.on('error', (err) => {
    log('❌ Archive error: ' + err.message);
    process.exit(1);
  });

  output.on('close', () => {
    const stats = fs.statSync(OUTPUT_ZIP);
    
    logSection('📦 BUILD SUMMARY');
    log(`📍 Location: ${OUTPUT_ZIP}`);
    log(`📊 Size: ${formatBytes(stats.size)}`);
    log(`📦 Total bytes: ${stats.size.toLocaleString()}`);
    logSection('✅ PRODUCTION BUILD COMPLETE');
    log('\n✅ Your app is ready for deployment!\n');
  });

  archive.pipe(output);

  for (const item of itemsToZip) {
    const itemPath = path.join(PROJECT_ROOT, item);
    
    if (!fs.existsSync(itemPath)) {
      log(`⚠️  Skipping missing: ${item}`);
      continue;
    }
    
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      archive.directory(itemPath, item);
      log(`✓ Added directory: ${item}`);
    } else {
      archive.file(itemPath, { name: item });
      log(`✓ Added file: ${item}`);
    }
  }

  archive.finalize();

} catch (error) {
  log('❌ Error creating zip: ' + error.message);
  process.exit(1);
}

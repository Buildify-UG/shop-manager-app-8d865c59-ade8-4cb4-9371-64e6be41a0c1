#!/usr/bin/env node

/**
 * Production Build & Compression Script
 * Creates a production build and compresses the entire project into a zip file
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const outputZipPath = path.join(projectRoot, 'shop-manager-app.zip');

console.log('🚀 Shop Manager App - Production Build & Compression Script\n');
console.log('=' .repeat(60));

// Step 1: Build
console.log('\n📋 Step 1: Creating Production Build');
console.log('-'.repeat(60));

try {
  console.log('Running: npm run build\n');
  
  const buildResult = spawnSync('npm', ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });
  
  if (buildResult.status !== 0) {
    console.error('\n❌ Build failed with exit code:', buildResult.status);
    process.exit(1);
  }
  
  console.log('\n✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Error during build:', error.message);
  process.exit(1);
}

// Step 2: Check if dist folder exists
console.log('\n📋 Step 2: Verifying Build Output');
console.log('-'.repeat(60));

const distPath = path.join(projectRoot, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found after build!');
  process.exit(1);
}

const distSize = getDirectorySize(distPath);
console.log(`✅ dist folder found (${formatBytes(distSize)})`);

// Step 3: Create zip file
console.log('\n📋 Step 3: Creating Zip Archive');
console.log('-'.repeat(60));

// Remove existing zip
if (fs.existsSync(outputZipPath)) {
  fs.unlinkSync(outputZipPath);
  console.log('Removed existing zip file');
}

try {
  // Use system zip command if available
  console.log('Creating zip archive with compression...\n');
  
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
  
  const itemArgs = itemsToZip.filter(item => {
    const itemPath = path.join(projectRoot, item);
    if (!fs.existsSync(itemPath)) {
      console.log(`⚠️  Skipping missing: ${item}`);
      return false;
    }
    console.log(`✓ Including: ${item}`);
    return true;
  });
  
  // Use zip command
  const zipCommand = `cd "${projectRoot}" && zip -r -q "${outputZipPath}" ${itemArgs.map(item => `"${item}"`).join(' ')}`;
  
  execSync(zipCommand, { 
    stdio: 'inherit',
    shell: '/bin/bash'
  });
  
  // Verify zip was created
  if (!fs.existsSync(outputZipPath)) {
    throw new Error('Zip file was not created');
  }
  
  const stats = fs.statSync(outputZipPath);
  
  console.log('\n✅ Zip file created successfully!');
  console.log('\n' + '='.repeat(60));
  console.log('📦 BUILD SUMMARY');
  console.log('='.repeat(60));
  console.log(`📍 Location: ${outputZipPath}`);
  console.log(`📊 Size: ${formatBytes(stats.size)}`);
  console.log(`📦 Total bytes: ${stats.size.toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n✅ Production build and compression complete!\n');
  
  process.exit(0);
  
} catch (error) {
  // Fallback to archiver if zip command fails
  console.log('\n⚠️  Zip command failed, using Node.js archiver...\n');
  useArchiverFallback();
}

function useArchiverFallback() {
  try {
    const archiver = require('archiver');
    
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    output.on('close', () => {
      const stats = fs.statSync(outputZipPath);
      console.log('✅ Zip file created successfully!');
      console.log('\n' + '='.repeat(60));
      console.log('📦 BUILD SUMMARY');
      console.log('='.repeat(60));
      console.log(`📍 Location: ${outputZipPath}`);
      console.log(`📊 Size: ${formatBytes(stats.size)}`);
      console.log(`📦 Total bytes: ${stats.size.toLocaleString()}`);
      console.log('='.repeat(60));
      console.log('\n✅ Production build and compression complete!\n');
    });
    
    archive.pipe(output);
    
    const itemsToAdd = [
      { name: 'dist', type: 'directory' },
      { name: 'src', type: 'directory' },
      { name: 'node_modules', type: 'directory' },
      { name: 'public', type: 'directory' },
      { name: 'lib', type: 'directory' },
      { name: 'plugins', type: 'directory' },
      { name: 'docs', type: 'directory' },
      { name: 'package.json', type: 'file' },
      { name: 'package-lock.json', type: 'file' },
      { name: 'index.html', type: 'file' },
      { name: 'vite.config.ts', type: 'file' },
      { name: 'vite.config.buildify.ts', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
      { name: 'tsconfig.app.json', type: 'file' },
      { name: 'tsconfig.node.json', type: 'file' },
      { name: 'tailwind.config.ts', type: 'file' },
      { name: 'postcss.config.js', type: 'file' },
      { name: 'components.json', type: 'file' },
      { name: 'eslint.config.js', type: 'file' },
      { name: '.gitignore', type: 'file' }
    ];
    
    for (const item of itemsToAdd) {
      const itemPath = path.join(projectRoot, item.name);
      
      if (!fs.existsSync(itemPath)) {
        console.log(`⚠️  Skipping missing: ${item.name}`);
        continue;
      }
      
      if (item.type === 'directory') {
        archive.directory(itemPath, item.name);
      } else {
        archive.file(itemPath, { name: item.name });
      }
      console.log(`✓ Added: ${item.name}`);
    }
    
    archive.finalize();
    
  } catch (error) {
    console.error('❌ Error creating zip:', error.message);
    process.exit(1);
  }
}

function getDirectorySize(dirPath) {
  let size = 0;
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
  
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

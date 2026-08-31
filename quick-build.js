#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = '/project';
process.chdir(projectRoot);

console.log('🚀 Starting production build and compression...\n');

// Step 1: Build
console.log('📋 Step 1: Creating production build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create zip
console.log('📋 Step 2: Creating zip archive...');
const outputZip = '/project/shop-manager-app.zip';

// Remove existing zip
if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
}

try {
  // Create zip using the zip command
  const zipCmd = `cd /project && zip -r -q shop-manager-app.zip dist src node_modules public lib plugins docs package.json package-lock.json index.html vite.config.ts vite.config.buildify.ts tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.ts postcss.config.js components.json eslint.config.js .gitignore`;
  
  execSync(zipCmd, { 
    stdio: 'pipe',
    shell: '/bin/bash'
  });
  
  const stats = fs.statSync(outputZip);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ Zip created!\n');
  console.log('='.repeat(60));
  console.log('📦 BUILD COMPLETE');
  console.log('='.repeat(60));
  console.log(`📍 Location: ${outputZip}`);
  console.log(`📊 Size: ${sizeInMB} MB (${stats.size.toLocaleString()} bytes)`);
  console.log('='.repeat(60));
  console.log('\n✅ Ready for deployment!\n');
  
} catch (error) {
  console.error('❌ Zip creation failed:', error.message);
  process.exit(1);
}

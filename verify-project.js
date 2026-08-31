#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/project';

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

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

console.log('\n📊 Project Structure Verification\n');
console.log('='.repeat(60));

const itemsToCheck = [
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

console.log('\nProject Files & Directories:\n');

let totalSize = 0;

for (const item of itemsToCheck) {
  const itemPath = path.join(PROJECT_ROOT, item);
  
  if (!fs.existsSync(itemPath)) {
    console.log(`❌ Missing: ${item}`);
    continue;
  }
  
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    const dirSize = getDirectorySize(itemPath);
    totalSize += dirSize;
    console.log(`✓ ${item}/ (${formatBytes(dirSize)})`);
  } else {
    totalSize += stat.size;
    console.log(`✓ ${item} (${formatBytes(stat.size)})`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`📊 Total Size: ${formatBytes(totalSize)}`);
console.log('='.repeat(60) + '\n');

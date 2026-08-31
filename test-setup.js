#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/project';

console.log('\n📋 Testing Build Setup...\n');

const checks = [
  { name: 'package.json', path: 'package.json', type: 'file' },
  { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file' },
  { name: 'src directory', path: 'src', type: 'dir' },
  { name: 'dist directory', path: 'dist', type: 'dir' },
  { name: 'node_modules', path: 'node_modules', type: 'dir' },
  { name: 'public directory', path: 'public', type: 'dir' },
];

let allGood = true;

for (const check of checks) {
  const fullPath = path.join(PROJECT_ROOT, check.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stat = fs.statSync(fullPath);
    if (check.type === 'dir' && stat.isDirectory()) {
      console.log(`✅ ${check.name}`);
    } else if (check.type === 'file' && stat.isFile()) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} (wrong type)`);
      allGood = false;
    }
  } else {
    console.log(`❌ ${check.name} (missing)`);
    allGood = false;
  }
}

console.log();

if (allGood) {
  console.log('✅ All checks passed! Ready to build.\n');
  console.log('Run: python3 /project/finalize-build.py\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed!\n');
  process.exit(1);
}

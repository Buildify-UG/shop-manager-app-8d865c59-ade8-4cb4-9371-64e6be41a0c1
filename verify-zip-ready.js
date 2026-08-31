#!/usr/bin/env node
/**
 * Verification script to check if all requirements are met
 * for creating the zip file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n' + '='.repeat(70));
console.log('🔍 ZIP FILE CREATION - VERIFICATION REPORT');
console.log('='.repeat(70) + '\n');

const checks = [];

// 1. Check archiver package
console.log('1️⃣  Checking archiver package...');
try {
  const archiverPath = path.join(__dirname, 'node_modules', 'archiver', 'package.json');
  if (fs.existsSync(archiverPath)) {
    const pkg = JSON.parse(fs.readFileSync(archiverPath, 'utf-8'));
    console.log(`   ✅ archiver v${pkg.version} installed\n`);
    checks.push(true);
  } else {
    console.log('   ❌ archiver not found\n');
    checks.push(false);
  }
} catch (e) {
  console.log(`   ❌ Error: ${e.message}\n`);
  checks.push(false);
}

// 2. Check dist directory
console.log('2️⃣  Checking dist directory...');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`   ✅ dist/ exists with ${files.length} items`);
  files.forEach(f => console.log(`      - ${f}`));
  console.log();
  checks.push(true);
} else {
  console.log('   ❌ dist/ not found\n');
  checks.push(false);
}

// 3. Check src directory
console.log('3️⃣  Checking src directory...');
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  const files = fs.readdirSync(srcPath);
  console.log(`   ✅ src/ exists with ${files.length} items`);
  files.forEach(f => console.log(`      - ${f}`));
  console.log();
  checks.push(true);
} else {
  console.log('   ❌ src/ not found\n');
  checks.push(false);
}

// 4. Check package.json
console.log('4️⃣  Checking package.json...');
const pkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  console.log(`   ✅ package.json found`);
  console.log(`      - Name: ${pkg.name}`);
  console.log(`      - Version: ${pkg.version}`);
  console.log();
  checks.push(true);
} else {
  console.log('   ❌ package.json not found\n');
  checks.push(false);
}

// 5. Check index.html
console.log('5️⃣  Checking index.html...');
const htmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(htmlPath)) {
  const stats = fs.statSync(htmlPath);
  console.log(`   ✅ index.html found (${stats.size} bytes)`);
  console.log();
  checks.push(true);
} else {
  console.log('   ❌ index.html not found\n');
  checks.push(false);
}

// 6. Check if zip already exists
console.log('6️⃣  Checking for existing zip file...');
const zipPath = path.join(__dirname, 'shop-manager-app.zip');
if (fs.existsSync(zipPath)) {
  const stats = fs.statSync(zipPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   ⚠️  Existing zip found: ${sizeInMB} MB`);
  console.log(`      (will be replaced)\n`);
} else {
  console.log('   ✅ No existing zip (fresh creation)\n');
}

// Summary
console.log('='.repeat(70));
const passed = checks.filter(c => c).length;
const total = checks.length;

if (passed === total) {
  console.log(`✅ ALL CHECKS PASSED (${passed}/${total})`);
  console.log('\n🚀 Ready to create zip file!');
  console.log('\n📝 Run this command to create the zip:\n');
  console.log('   node build-zip.mjs\n');
  console.log('='.repeat(70) + '\n');
  process.exit(0);
} else {
  console.log(`❌ SOME CHECKS FAILED (${passed}/${total})`);
  console.log('\n⚠️  Please fix the issues above before creating the zip.\n');
  console.log('='.repeat(70) + '\n');
  process.exit(1);
}

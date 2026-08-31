#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zipPath = path.join(__dirname, 'shop-manager-app.zip');

console.log('\n🚀 Executing ZIP file creation...\n');

try {
  // Execute the CREATE-ZIP-NOW.js script
  execSync('node CREATE-ZIP-NOW.js', {
    cwd: __dirname,
    stdio: 'inherit'
  });

  // Verify the zip was created
  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    console.log('\n✅ ZIP file successfully created and verified!');
    console.log(`📦 File: ${zipPath}`);
    console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
    process.exit(0);
  } else {
    console.error('\n❌ ZIP file was not created!\n');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Error during ZIP creation:\n', error.message, '\n');
  process.exit(1);
}

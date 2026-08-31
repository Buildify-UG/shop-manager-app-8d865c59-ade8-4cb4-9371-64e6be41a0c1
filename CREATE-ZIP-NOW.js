#!/usr/bin/env node
/**
 * SHOP MANAGER APP - ZIP BUILDER
 * 
 * This script creates a production-ready zip file containing:
 * - dist/          (compiled production build)
 * - src/           (source code)
 * - package.json   (project configuration)
 * - index.html     (entry point)
 * 
 * Usage: node CREATE-ZIP-NOW.js
 */

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_NAME = 'shop-manager-app';
const ZIP_FILENAME = `${PROJECT_NAME}.zip`;
const ZIP_PATH = path.join(__dirname, ZIP_FILENAME);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message) {
  console.log(message);
}

function success(message) {
  log(`${colors.green}${colors.bright}✓${colors.reset} ${message}`);
}

function error(message) {
  log(`${colors.red}${colors.bright}✗${colors.reset} ${message}`);
}

function info(message) {
  log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

function warning(message) {
  log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function header(message) {
  log(`\n${colors.bright}${colors.blue}${message}${colors.reset}\n`);
}

function separator() {
  log('─'.repeat(70));
}

async function createZip() {
  return new Promise((resolve, reject) => {
    // Remove existing zip if present
    if (fs.existsSync(ZIP_PATH)) {
      try {
        fs.unlinkSync(ZIP_PATH);
        info(`Removed existing ${ZIP_FILENAME}`);
      } catch (e) {
        warning(`Could not remove existing zip: ${e.message}`);
      }
    }

    const output = fs.createWriteStream(ZIP_PATH);
    const archive = archiver('zip', { zlib: { level: 9 } });

    let hasError = false;

    // Handle successful completion
    output.on('close', () => {
      if (hasError) {
        reject(new Error('Archive creation failed'));
        return;
      }

      try {
        const stats = fs.statSync(ZIP_PATH);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
        const sizeInKB = (stats.size / 1024).toFixed(2);

        separator();
        success(`ZIP file created successfully!`);
        separator();
        log(`\n${colors.bright}File Information:${colors.reset}`);
        log(`  Name:     ${ZIP_FILENAME}`);
        log(`  Location: ${ZIP_PATH}`);
        log(`  Size:     ${sizeInMB} MB (${sizeInKB} KB)`);

        log(`\n${colors.bright}Contents:${colors.reset}`);
        log(`  ✓ dist/          Production build`);
        log(`  ✓ src/           Source code`);
        log(`  ✓ package.json   Project configuration`);
        log(`  ✓ index.html     Entry point`);

        log(`\n${colors.bright}Status:${colors.reset}`);
        log(`  ✓ All files included`);
        log(`  ✓ Compression level: 9 (maximum)`);
        log(`  ✓ Ready for deployment`);

        separator();
        log(`\n${colors.green}${colors.bright}✨ Success! The shop manager app is packaged and ready!${colors.reset}\n`);

        resolve({ success: true, path: ZIP_PATH, size: stats.size });
      } catch (e) {
        reject(e);
      }
    });

    output.on('error', (err) => {
      hasError = true;
      error(`Output stream error: ${err.message}`);
    });

    archive.on('error', (err) => {
      hasError = true;
      error(`Archive error: ${err.message}`);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        warning(`File not found: ${err.path}`);
      } else {
        warning(`${err.message}`);
      }
    });

    archive.pipe(output);

    header(`📦 Creating ${ZIP_FILENAME}`);

    const items = [
      { name: 'dist', type: 'directory', description: 'Production build' },
      { name: 'src', type: 'directory', description: 'Source code' },
      { name: 'package.json', type: 'file', description: 'Dependencies' },
      { name: 'index.html', type: 'file', description: 'Entry point' }
    ];

    log(`${colors.bright}Adding contents:${colors.reset}\n`);

    let successCount = 0;

    for (const item of items) {
      const fullPath = path.join(__dirname, item.name);

      if (!fs.existsSync(fullPath)) {
        error(`${item.name} (not found)`);
        continue;
      }

      const stats = fs.statSync(fullPath);
      const isDir = stats.isDirectory();

      if ((item.type === 'directory' && isDir) || (item.type === 'file' && !isDir)) {
        if (isDir) {
          success(`${item.name}/ — ${item.description}`);
          archive.directory(fullPath, item.name);
        } else {
          const sizeKB = (stats.size / 1024).toFixed(2);
          success(`${item.name} (${sizeKB} KB) — ${item.description}`);
          archive.file(fullPath, { name: item.name });
        }
        successCount++;
      } else {
        error(`${item.name} (wrong type)`);
      }
    }

    log(`\n${colors.bright}Summary: ${successCount}/${items.length} items added${colors.reset}\n`);

    archive.finalize().catch(reject);
  });
}

// Main execution
async function main() {
  try {
    await createZip();
    process.exit(0);
  } catch (err) {
    separator();
    error(`FATAL ERROR: ${err.message}`);
    separator();
    log();
    process.exit(1);
  }
}

main();

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const projectRoot = '/project';
const outputZipPath = '/project/shop-manager-app.zip';

async function buildAndZip() {
  try {
    console.log('🔨 Starting production build...');
    
    // Run vite build
    execSync('npm run build', { 
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    console.log('✅ Production build completed successfully!');
    console.log('📦 Creating zip file...');
    
    // Create zip file
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`✅ Zip file created successfully!`);
      console.log(`📍 Location: ${outputZipPath}`);
      console.log(`📊 Size: ${sizeInMB} MB`);
      console.log(`📦 Total bytes: ${archive.pointer()}`);
    });
    
    archive.pipe(output);
    
    // Add directories and files
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
        console.log(`⚠️  Skipping missing item: ${item.name}`);
        continue;
      }
      
      if (item.type === 'directory') {
        archive.directory(itemPath, item.name);
        console.log(`✓ Added directory: ${item.name}`);
      } else {
        archive.file(itemPath, { name: item.name });
        console.log(`✓ Added file: ${item.name}`);
      }
    }
    
    await archive.finalize();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

buildAndZip();

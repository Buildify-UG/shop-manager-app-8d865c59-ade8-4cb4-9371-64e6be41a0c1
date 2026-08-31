#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const projectRoot = '/project';
const outputZipPath = '/project/shop-manager-app.zip';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function buildAndZip() {
  try {
    console.log('🔨 Starting production build...\n');
    
    // Run vite build
    execSync('npm run build', { 
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    console.log('\n✅ Production build completed successfully!\n');
    console.log('📦 Creating zip file...\n');
    
    // Remove existing zip if it exists
    if (fs.existsSync(outputZipPath)) {
      fs.unlinkSync(outputZipPath);
      console.log('Removed existing zip file\n');
    }
    
    // Create zip file
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    return new Promise((resolve, reject) => {
      archive.on('error', (err) => {
        reject(err);
      });
      
      output.on('close', () => {
        const stats = fs.statSync(outputZipPath);
        console.log('✅ Zip file created successfully!\n');
        console.log(`📍 Location: ${outputZipPath}`);
        console.log(`📊 Size: ${formatBytes(stats.size)}`);
        console.log(`📦 Total bytes: ${stats.size.toLocaleString()}\n`);
        resolve(true);
      });
      
      archive.pipe(output);
      
      // Items to add to zip
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
      
      archive.finalize();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

buildAndZip().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

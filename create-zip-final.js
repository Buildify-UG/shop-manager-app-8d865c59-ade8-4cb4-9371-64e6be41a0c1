const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = '/project';
const zipPath = '/project/shop-manager-app.zip';

try {
  console.log('Creating zip file...');
  
  // Remove old zip if exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Create zip using system command
  execSync(`cd ${projectDir} && zip -r shop-manager-app.zip dist src package.json package-lock.json vite.config.ts tsconfig.json tailwind.config.ts index.html public lib -q`, {
    stdio: 'inherit'
  });

  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Zip file created successfully!`);
    console.log(`📦 File: ${zipPath}`);
    console.log(`📊 Size: ${sizeMB} MB`);
  }
} catch (error) {
  console.error('Error creating zip:', error.message);
}

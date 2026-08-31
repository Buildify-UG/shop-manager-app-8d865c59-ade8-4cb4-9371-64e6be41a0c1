const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const projectRoot = '/project';
const outputZip = path.join(projectRoot, 'shop-manager-app.zip');

console.log('\n🚀 Shop Manager App - Production Build & Compression\n');
console.log('='.repeat(60));

// Step 1: Build
console.log('\n📋 Step 1: Creating Production Build');
console.log('-'.repeat(60) + '\n');

try {
  const buildOutput = execSync('npm run build', {
    cwd: projectRoot,
    encoding: 'utf-8'
  });
  console.log(buildOutput);
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Verify build output
console.log('\n📋 Step 2: Verifying Build Output');
console.log('-'.repeat(60));

const distPath = path.join(projectRoot, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found after build!');
  process.exit(1);
}

const distSize = getDirectorySize(distPath);
console.log(`✅ dist folder verified (${formatBytes(distSize)})`);

// Step 3: Create zip
console.log('\n📋 Step 3: Creating Zip Archive');
console.log('-'.repeat(60) + '\n');

if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
  console.log('Removed existing zip file\n');
}

const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', { zlib: { level: 9 } });

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

console.log('Adding files to archive:\n');

archive.on('error', (err) => {
  console.error('❌ Archive error:', err.message);
  process.exit(1);
});

output.on('close', () => {
  const stats = fs.statSync(outputZip);
  
  console.log('\n✅ Zip file created successfully!');
  console.log('\n' + '='.repeat(60));
  console.log('📦 BUILD SUMMARY');
  console.log('='.repeat(60));
  console.log(`📍 Location: ${outputZip}`);
  console.log(`📊 Size: ${formatBytes(stats.size)}`);
  console.log(`📦 Total bytes: ${stats.size.toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n✅ Production build and compression complete!\n');
});

archive.pipe(output);

for (const item of itemsToZip) {
  const itemPath = path.join(projectRoot, item);
  
  if (!fs.existsSync(itemPath)) {
    console.log(`⚠️  Skipping missing: ${item}`);
    continue;
  }
  
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory()) {
    archive.directory(itemPath, item);
    console.log(`✓ Added directory: ${item}`);
  } else {
    archive.file(itemPath, { name: item });
    console.log(`✓ Added file: ${item}`);
  }
}

archive.finalize();

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

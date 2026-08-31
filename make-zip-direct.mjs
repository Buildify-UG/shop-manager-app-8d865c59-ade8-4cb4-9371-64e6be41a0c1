import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const zipFilePath = path.join(__dirname, 'shop-manager-app.zip');

// Remove existing zip file if it exists
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', { zlib: { level: 9 } });

let isError = false;

output.on('close', () => {
  if (!isError) {
    const stats = fs.statSync(zipFilePath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log('\n✅ SUCCESS! ZIP file created successfully!');
    console.log(`📦 File path: ${zipFilePath}`);
    console.log(`📊 File size: ${sizeInMB} MB (${stats.size} bytes)`);
    console.log('\n📋 Contents:');
    console.log('   - dist/          (compiled app)');
    console.log('   - src/           (source code)');
    console.log('   - package.json   (dependencies)');
    console.log('   - index.html     (entry point)');
    console.log('\n✨ The shop manager app is ready for deployment!');
  }
  process.exit(isError ? 1 : 0);
});

output.on('error', (err) => {
  isError = true;
  console.error('❌ Stream error:', err.message);
});

archive.on('error', (err) => {
  isError = true;
  console.error('❌ Archive error:', err.message);
});

archive.on('warning', (err) => {
  if (err.code !== 'ENOENT') {
    console.warn('⚠️ Warning:', err.message);
  }
});

archive.pipe(output);

console.log('🚀 Creating zip file: shop-manager-app.zip');
console.log('📂 Adding contents...\n');

// Add dist directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('  ✓ dist/');
  archive.directory(distPath, 'dist');
} else {
  console.log('  ⚠️ dist/ (not found)');
}

// Add src directory
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  console.log('  ✓ src/');
  archive.directory(srcPath, 'src');
} else {
  console.log('  ⚠️ src/ (not found)');
}

// Add package.json
const pkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgPath)) {
  console.log('  ✓ package.json');
  archive.file(pkgPath, { name: 'package.json' });
} else {
  console.log('  ⚠️ package.json (not found)');
}

// Add index.html
const htmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(htmlPath)) {
  console.log('  ✓ index.html');
  archive.file(htmlPath, { name: 'index.html' });
} else {
  console.log('  ⚠️ index.html (not found)');
}

console.log();
archive.finalize();

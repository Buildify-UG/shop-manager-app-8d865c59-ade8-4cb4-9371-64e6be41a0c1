const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const output = fs.createWriteStream('/project/shop-manager-app.zip');
const archive = archiver('zip', { zlib: { level: 6 } });

output.on('close', function() {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Zip created: /project/shop-manager-app.zip`);
  console.log(`📦 Size: ${sizeMB} MB`);
});

archive.on('error', function(err) {
  console.error('Error:', err.message);
});

archive.pipe(output);

// Add folders
archive.directory('/project/dist', 'dist');
archive.directory('/project/src', 'src');
archive.directory('/project/public', 'public');
archive.directory('/project/lib', 'lib');

// Add files
archive.file('/project/package.json', { name: 'package.json' });
archive.file('/project/package-lock.json', { name: 'package-lock.json' });
archive.file('/project/vite.config.ts', { name: 'vite.config.ts' });
archive.file('/project/tsconfig.json', { name: 'tsconfig.json' });
archive.file('/project/tailwind.config.ts', { name: 'tailwind.config.ts' });
archive.file('/project/index.html', { name: 'index.html' });

archive.finalize();

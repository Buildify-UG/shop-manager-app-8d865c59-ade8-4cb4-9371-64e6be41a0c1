#!/bin/bash

# Shop Manager App - Production Build Script
# Creates a production build and compresses the project into a zip file

cd /project

echo ""
echo "=================================================="
echo "🚀 SHOP MANAGER APP - PRODUCTION BUILD"
echo "=================================================="
echo ""

# Step 1: Build
echo "📋 Step 1: Creating Production Build"
echo "--------------------------------------------------"
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "✅ Build completed successfully!"
echo ""

# Step 2: Create zip using Python
echo "📋 Step 2: Creating Zip Archive"
echo "--------------------------------------------------"
echo ""

python3 << 'PYTHON_SCRIPT'
import os
import sys
import zipfile
from pathlib import Path

PROJECT_ROOT = Path('/project')
OUTPUT_ZIP = PROJECT_ROOT / 'shop-manager-app.zip'

# Remove old zip
if OUTPUT_ZIP.exists():
    OUTPUT_ZIP.unlink()

items = [
    'dist', 'src', 'node_modules', 'public', 'lib', 'plugins', 'docs',
    'package.json', 'package-lock.json', 'index.html',
    'vite.config.ts', 'vite.config.buildify.ts',
    'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
    'tailwind.config.ts', 'postcss.config.js', 'components.json',
    'eslint.config.js', '.gitignore'
]

print('Adding files to archive:\n')

with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for item in items:
        item_path = PROJECT_ROOT / item
        
        if not item_path.exists():
            print(f'  ⚠️  Skipping: {item}')
            continue
        
        if item_path.is_dir():
            for file_path in item_path.rglob('*'):
                if file_path.is_file():
                    arcname = str(file_path.relative_to(PROJECT_ROOT))
                    zf.write(file_path, arcname)
            print(f'  ✓ Added: {item}/')
        else:
            zf.write(item_path, item)
            print(f'  ✓ Added: {item}')

stats = OUTPUT_ZIP.stat()
size_mb = stats.st_size / (1024 * 1024)

print('\n' + '='*60)
print('✅ ZIP FILE CREATED')
print('='*60)
print(f'\n📍 Location: {OUTPUT_ZIP}')
print(f'📊 Size: {size_mb:.2f} MB\n')
PYTHON_SCRIPT

echo ""
echo "=================================================="
echo "✅ PRODUCTION BUILD COMPLETE"
echo "=================================================="
echo ""
echo "📦 Output: /project/shop-manager-app.zip"
echo ""
echo "Ready for deployment!"
echo ""

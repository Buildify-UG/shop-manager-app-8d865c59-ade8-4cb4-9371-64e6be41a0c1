#!/bin/bash

set -e

cd /project

echo ""
echo "=================================================="
echo "🚀 Shop Manager App - Production Build"
echo "=================================================="
echo ""

echo "📋 Step 1: Creating Production Build"
echo "--------------------------------------------------"
echo ""

npm run build

echo ""
echo "✅ Build completed successfully!"
echo ""

echo "📋 Step 2: Verifying Build Output"
echo "--------------------------------------------------"
echo ""

if [ ! -d "dist" ]; then
  echo "❌ dist folder not found after build!"
  exit 1
fi

echo "✅ dist folder verified"
echo ""

echo "📋 Step 3: Creating Zip Archive"
echo "--------------------------------------------------"
echo ""

# Remove existing zip
if [ -f "shop-manager-app.zip" ]; then
  rm shop-manager-app.zip
  echo "Removed existing zip file"
  echo ""
fi

echo "Adding files to archive..."
echo ""

# Create zip with all necessary files
zip -r -q shop-manager-app.zip \
  dist \
  src \
  node_modules \
  public \
  lib \
  plugins \
  docs \
  package.json \
  package-lock.json \
  index.html \
  vite.config.ts \
  vite.config.buildify.ts \
  tsconfig.json \
  tsconfig.app.json \
  tsconfig.node.json \
  tailwind.config.ts \
  postcss.config.js \
  components.json \
  eslint.config.js \
  .gitignore

echo "✓ Added dist"
echo "✓ Added src"
echo "✓ Added node_modules"
echo "✓ Added public"
echo "✓ Added lib"
echo "✓ Added plugins"
echo "✓ Added docs"
echo "✓ Added config files"
echo ""

# Get file size
SIZE=$(du -h shop-manager-app.zip | cut -f1)

echo "✅ Zip file created successfully!"
echo ""
echo "=================================================="
echo "📦 BUILD SUMMARY"
echo "=================================================="
echo "📍 Location: /project/shop-manager-app.zip"
echo "📊 Size: $SIZE"
echo "=================================================="
echo ""
echo "✅ Production build and compression complete!"
echo "✅ Your app is ready for deployment!"
echo ""

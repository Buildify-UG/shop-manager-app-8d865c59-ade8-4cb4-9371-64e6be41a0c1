#!/bin/bash

set -e

cd /project

echo "🔨 Starting production build..."
npm run build

echo "✅ Production build completed successfully!"
echo "📦 Creating zip file..."

# Remove existing zip if it exists
if [ -f "shop-manager-app.zip" ]; then
  rm shop-manager-app.zip
  echo "Removed existing zip file"
fi

# Create zip with all necessary files and directories
zip -r -q shop-manager-app.zip \
  dist/ \
  src/ \
  node_modules/ \
  public/ \
  lib/ \
  plugins/ \
  docs/ \
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

# Get file size
SIZE=$(du -h shop-manager-app.zip | cut -f1)
BYTES=$(stat -f%z shop-manager-app.zip 2>/dev/null || stat -c%s shop-manager-app.zip 2>/dev/null)

echo "✅ Zip file created successfully!"
echo "📍 Location: /project/shop-manager-app.zip"
echo "📊 Size: $SIZE"
echo "📦 Total bytes: $BYTES"

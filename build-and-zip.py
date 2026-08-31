#!/usr/bin/env python3

import subprocess
import os
import zipfile
import shutil
from pathlib import Path

project_root = Path('/project')
output_zip_path = project_root / 'shop-manager-app.zip'

def build_and_zip():
    try:
        # Step 1: Create production build
        print("🔨 Starting production build...")
        result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=project_root,
            capture_output=False
        )
        
        if result.returncode != 0:
            print("❌ Build failed!")
            return False
        
        print("✅ Production build completed successfully!")
        
        # Step 2: Create zip file
        print("📦 Creating zip file...")
        
        # Remove existing zip if it exists
        if output_zip_path.exists():
            output_zip_path.unlink()
            print("Removed existing zip file")
        
        # Items to add to zip
        items_to_add = [
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
        ]
        
        # Create zip file
        with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for item in items_to_add:
                item_path = project_root / item
                
                if not item_path.exists():
                    print(f"⚠️  Skipping missing item: {item}")
                    continue
                
                if item_path.is_dir():
                    # Add directory recursively
                    for root, dirs, files in os.walk(item_path):
                        for file in files:
                            file_path = Path(root) / file
                            arcname = file_path.relative_to(project_root)
                            zipf.write(file_path, arcname)
                    print(f"✓ Added directory: {item}")
                else:
                    # Add file
                    zipf.write(item_path, item_path.relative_to(project_root))
                    print(f"✓ Added file: {item}")
        
        # Get file size
        zip_size_bytes = output_zip_path.stat().st_size
        zip_size_mb = zip_size_bytes / (1024 * 1024)
        
        print("\n✅ Zip file created successfully!")
        print(f"📍 Location: {output_zip_path}")
        print(f"📊 Size: {zip_size_mb:.2f} MB")
        print(f"📦 Total bytes: {zip_size_bytes:,}")
        
        return True
        
    except Exception as error:
        print(f"❌ Error: {str(error)}")
        return False

if __name__ == '__main__':
    success = build_and_zip()
    exit(0 if success else 1)

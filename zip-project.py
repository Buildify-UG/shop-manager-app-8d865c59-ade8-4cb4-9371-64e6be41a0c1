#!/usr/bin/env python3
"""
Production Build Compression Script
Creates a zip file of the entire Shop Manager App project
"""

import os
import sys
import zipfile
from pathlib import Path

def main():
    PROJECT_ROOT = Path('/project')
    OUTPUT_ZIP = PROJECT_ROOT / 'shop-manager-app.zip'
    
    print('\n' + '='*70)
    print('📦 SHOP MANAGER APP - PROJECT COMPRESSION')
    print('='*70 + '\n')
    
    # Items to include
    items_to_zip = [
        'dist', 'src', 'node_modules', 'public', 'lib', 'plugins', 'docs',
        'package.json', 'package-lock.json', 'index.html',
        'vite.config.ts', 'vite.config.buildify.ts',
        'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
        'tailwind.config.ts', 'postcss.config.js', 'components.json',
        'eslint.config.js', '.gitignore'
    ]
    
    # Remove old zip
    if OUTPUT_ZIP.exists():
        OUTPUT_ZIP.unlink()
        print('✓ Removed existing zip file\n')
    
    print('Adding files to archive:\n')
    
    try:
        with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
            for item in items_to_zip:
                item_path = PROJECT_ROOT / item
                
                if not item_path.exists():
                    print(f'  ⚠️  Skipping (not found): {item}')
                    continue
                
                if item_path.is_dir():
                    # Add directory
                    for file_path in item_path.rglob('*'):
                        if file_path.is_file():
                            arcname = str(file_path.relative_to(PROJECT_ROOT))
                            zf.write(file_path, arcname)
                    print(f'  ✓ Added directory: {item}/')
                else:
                    # Add file
                    zf.write(item_path, item)
                    print(f'  ✓ Added file: {item}')
        
        # Verify and report
        if not OUTPUT_ZIP.exists():
            print('\n❌ Error: Zip file was not created!')
            sys.exit(1)
        
        stats = OUTPUT_ZIP.stat()
        size_mb = stats.st_size / (1024 * 1024)
        
        print('\n' + '='*70)
        print('✅ ZIP FILE CREATED SUCCESSFULLY')
        print('='*70)
        print(f'\n📍 Location: {OUTPUT_ZIP}')
        print(f'📊 Size: {size_mb:.2f} MB ({stats.st_size:,} bytes)')
        print('\n' + '='*70)
        print('✅ Ready for deployment!\n')
        
        return 0
        
    except Exception as e:
        print(f'\n❌ Error creating zip: {str(e)}\n')
        return 1

if __name__ == '__main__':
    sys.exit(main())

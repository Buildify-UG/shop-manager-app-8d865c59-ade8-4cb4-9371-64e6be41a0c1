#!/usr/bin/env python3
"""
Final Production Build & Compression Script
Handles building and zipping the Shop Manager App
"""

import os
import sys
import subprocess
import zipfile
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = '/project'
OUTPUT_ZIP = '/project/shop-manager-app.zip'

def print_header(text):
    print('\n' + '='*70)
    print(f'  {text}')
    print('='*70)

def print_step(num, text):
    print(f'\n📋 Step {num}: {text}')
    print('-'*70)

def print_success(text):
    print(f'✅ {text}')

def print_error(text):
    print(f'❌ {text}')

def print_warning(text):
    print(f'⚠️  {text}')

def format_bytes(bytes_val):
    """Format bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024:
            return f'{bytes_val:.2f} {unit}'
        bytes_val /= 1024
    return f'{bytes_val:.2f} TB'

def run_command(cmd, cwd=None):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd or PROJECT_ROOT,
            capture_output=False,
            text=True
        )
        return result.returncode == 0
    except Exception as e:
        print_error(f'Command failed: {str(e)}')
        return False

def verify_directory(path, name):
    """Verify a directory exists"""
    if os.path.isdir(path):
        size = sum(f.stat().st_size for f in Path(path).rglob('*') if f.is_file())
        print_success(f'{name} found ({format_bytes(size)})')
        return True
    else:
        print_warning(f'{name} not found')
        return False

def verify_file(path, name):
    """Verify a file exists"""
    if os.path.isfile(path):
        size = os.path.getsize(path)
        print_success(f'{name} found ({format_bytes(size)})')
        return True
    else:
        print_warning(f'{name} not found')
        return False

def create_zip():
    """Create zip file with all project files"""
    items_to_zip = [
        ('dist', True),
        ('src', True),
        ('node_modules', True),
        ('public', True),
        ('lib', True),
        ('plugins', True),
        ('docs', True),
        ('package.json', False),
        ('package-lock.json', False),
        ('index.html', False),
        ('vite.config.ts', False),
        ('vite.config.buildify.ts', False),
        ('tsconfig.json', False),
        ('tsconfig.app.json', False),
        ('tsconfig.node.json', False),
        ('tailwind.config.ts', False),
        ('postcss.config.js', False),
        ('components.json', False),
        ('eslint.config.js', False),
        ('.gitignore', False),
    ]
    
    print('\nAdding files to archive:\n')
    
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for item_name, is_dir in items_to_zip:
            item_path = os.path.join(PROJECT_ROOT, item_name)
            
            if not os.path.exists(item_path):
                print_warning(f'Skipping missing: {item_name}')
                continue
            
            try:
                if is_dir:
                    for root, dirs, files in os.walk(item_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, PROJECT_ROOT)
                            zf.write(file_path, arcname)
                    print_success(f'Added directory: {item_name}/')
                else:
                    zf.write(item_path, item_name)
                    print_success(f'Added file: {item_name}')
            except Exception as e:
                print_error(f'Failed to add {item_name}: {str(e)}')
    
    return os.path.exists(OUTPUT_ZIP)

def main():
    """Main execution"""
    print_header('🚀 SHOP MANAGER APP - PRODUCTION BUILD')
    
    # Step 1: Build
    print_step(1, 'Creating Production Build')
    print('\nRunning: npm run build\n')
    
    if not run_command('npm run build'):
        print_error('Build failed!')
        sys.exit(1)
    
    print_success('Build completed successfully!')
    
    # Step 2: Verify build output
    print_step(2, 'Verifying Build Output')
    print()
    
    dist_path = os.path.join(PROJECT_ROOT, 'dist')
    if not verify_directory(dist_path, 'dist'):
        print_error('dist directory not found after build!')
        sys.exit(1)
    
    # Step 3: Create zip
    print_step(3, 'Creating Zip Archive')
    
    # Remove existing zip
    if os.path.exists(OUTPUT_ZIP):
        os.remove(OUTPUT_ZIP)
        print_success('Removed existing zip file')
    
    print()
    
    if not create_zip():
        print_error('Failed to create zip file!')
        sys.exit(1)
    
    # Step 4: Verify zip
    print_step(4, 'Verifying Zip File')
    print()
    
    if not os.path.exists(OUTPUT_ZIP):
        print_error('Zip file was not created!')
        sys.exit(1)
    
    zip_stats = os.stat(OUTPUT_ZIP)
    zip_size_mb = zip_stats.st_size / (1024 * 1024)
    
    print_success(f'Zip file verified')
    
    # Final summary
    print_header('✅ PRODUCTION BUILD COMPLETE')
    
    print(f'\n📍 Location: {OUTPUT_ZIP}')
    print(f'📊 Size: {zip_size_mb:.2f} MB ({zip_stats.st_size:,} bytes)')
    print(f'📅 Created: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    
    print('\n' + '='*70)
    print('✅ Your production build is ready for deployment!')
    print('='*70 + '\n')
    
    # Next steps
    print('📋 Next Steps:')
    print('   1. Download the zip file from your project storage')
    print('   2. Extract it on your deployment server')
    print('   3. Deploy the dist/ folder to your hosting service')
    print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\n\n⚠️  Build interrupted by user')
        sys.exit(1)
    except Exception as e:
        print_error(f'Unexpected error: {str(e)}')
        sys.exit(1)

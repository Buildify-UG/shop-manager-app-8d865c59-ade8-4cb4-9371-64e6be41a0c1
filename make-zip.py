#!/usr/bin/env python3

import os
import zipfile
import sys

def create_zip():
    root = '/project'
    output = '/project/shop-manager-app.zip'
    
    # Remove old zip
    if os.path.exists(output):
        os.remove(output)
    
    items = [
        'dist', 'src', 'node_modules', 'public', 'lib', 'plugins', 'docs',
        'package.json', 'package-lock.json', 'index.html',
        'vite.config.ts', 'vite.config.buildify.ts',
        'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
        'tailwind.config.ts', 'postcss.config.js', 'components.json',
        'eslint.config.js', '.gitignore'
    ]
    
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as z:
        for item in items:
            path = os.path.join(root, item)
            if os.path.isdir(path):
                for r, d, f in os.walk(path):
                    for file in f:
                        fp = os.path.join(r, file)
                        an = os.path.relpath(fp, root)
                        z.write(fp, an)
            elif os.path.isfile(path):
                z.write(path, item)
    
    return output

try:
    zf = create_zip()
    size = os.path.getsize(zf) / (1024 * 1024)
    print(f'\n✅ Created: {zf}')
    print(f'📊 Size: {size:.2f} MB\n')
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)

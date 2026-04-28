import subprocess
import os

assets_dir = os.path.join(os.path.dirname(__file__), 'assets')
svg_file = os.path.join(assets_dir, 'icon.svg')

sizes = [
    ('icon.png',          1024),
    ('adaptive-icon.png', 1024),
    ('splash.png',        2048),
    ('favicon.png',        196),
]

for filename, size in sizes:
    output = os.path.join(assets_dir, filename)
    cmd = ['npx', 'sharp-cli', '--input', svg_file, '--output', output, 'resize', str(size), str(size)]
    print(f'Generating {filename} at {size}x{size}...')
    subprocess.run(cmd, check=True)
    print(f'Done: {filename}')

print('\nAll assets generated!')
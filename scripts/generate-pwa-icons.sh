#!/bin/sh
# Regenerates the PWA icons in public/ from assets/branding/wyre-app-icon.svg.
# macOS only (uses Quick Look to rasterise the SVG and sips to resize).
set -e
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
python3 - "$TMP" <<'PY'
import re, sys
out = sys.argv[1]
src = open('assets/branding/wyre-app-icon.svg').read()
src = re.sub(r'<metadata>.*?</metadata>', '', src, flags=re.S)
open(f'{out}/icon.svg', 'w').write(src)
# Maskable: same full-bleed purple background, logo at 80% size so it sits inside the safe zone.
k = 0.8; sc = 7.28767 * k; w = 49 * sc; h = 73 * sc
m = src.replace('translate(333.452 246.000) scale(7.28767)',
                f'translate({512 - w / 2:.3f} {512 - h / 2:.3f}) scale({sc:.5f})')
open(f'{out}/maskable.svg', 'w').write(m)
PY
qlmanage -t -s 1024 -o "$TMP" "$TMP/icon.svg" "$TMP/maskable.svg" >/dev/null 2>&1
mkdir -p public/icons
sips -z 192 192 "$TMP/icon.svg.png" --out public/icons/icon-192.png >/dev/null
sips -z 512 512 "$TMP/icon.svg.png" --out public/icons/icon-512.png >/dev/null
sips -z 512 512 "$TMP/maskable.svg.png" --out public/icons/icon-maskable-512.png >/dev/null
sips -z 180 180 "$TMP/icon.svg.png" --out public/apple-touch-icon.png >/dev/null
sips -z 48 48 "$TMP/icon.svg.png" --out public/favicon.png >/dev/null
sips -s format ico -z 32 32 "$TMP/icon.svg.png" --out public/favicon.ico >/dev/null
rm -rf "$TMP"
echo "PWA icons written to public/"

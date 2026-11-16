#!/bin/sh
# Renders design/Site.icon (made in Icon Composer) into every favicon the site serves.
set -e
cd "$(dirname "$0")/.."
ICTOOL="/Applications/Xcode.app/Contents/Applications/Icon Composer.app/Contents/Executables/ictool"
OUT=public/assets/favicon
TMP=$(mktemp -d)
"$ICTOOL" design/Site.icon --export-image --output-file "$TMP/round.png" --platform iOS --rendition Default --width 1024 --height 1024 --scale 1 >/dev/null
# iOS and Android mask the icon themselves, so they get a full-bleed square on the same gradient as icon.json
magick -size 1024x1024 gradient:'#466be5-#2445b5' "$TMP/round.png" -composite "$TMP/square.png"
for f in "$OUT"/*.png; do
  n=$(magick identify -format '%w' "$f")
  case $(basename "$f") in
    favicon-*) src=round ;;
    *) src=square ;;
  esac
  magick "$TMP/$src.png" -resize "${n}x${n}" -strip "$f"
done
magick "$TMP/round.png" -define icon:auto-resize=48,32,16 "$OUT/favicon.ico"
cp "$OUT/favicon.ico" public/favicon.ico
rm -rf "$TMP"

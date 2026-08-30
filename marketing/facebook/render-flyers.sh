#!/usr/bin/env bash
set -euo pipefail

# Renderiza los SVG editables como PNG 1080×1350 usando ImageMagick.
# Se dibuja directamente (en lugar de delegar el SVG) para funcionar también
# en entornos que no tengan rsvg-convert/Inkscape instalado.

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
BURGUNDY="#6f1930"
GOLD="#f2ca5b"
GOLD_DARK="#c9a84c"
INK="#32101a"
GREEN="#1f9d64"

prepare_background() {
  local source="$1"
  local output="$2"

  convert "$source" \
    -resize '1080x1350^' -gravity center -extent 1080x1350 \
    "$TMP/base.png"

  # Degradado oscuro con borde difuminado para que el copy siempre sea legible.
  convert -size 1080x1350 xc:none \
    -fill 'rgba(25,2,9,0.79)' -draw 'rectangle -130,-130 580,1480' \
    -blur 0x74 "$TMP/left-shade.png"
  convert -size 1080x1350 xc:none \
    -fill 'rgba(16,1,6,0.61)' -draw 'rectangle -100,1240 1180,1450' \
    -blur 0x58 "$TMP/bottom-shade.png"

  convert "$TMP/base.png" "$TMP/left-shade.png" -compose over -composite \
    "$TMP/bottom-shade.png" -compose over -composite "$output"
}

add_brand_header() {
  local input="$1"
  local output="$2"

  convert "$input" \
    -fill 'rgba(255,255,255,0.97)' -stroke none \
    -draw 'roundrectangle 64,48 484,147 25,25' \
    -font "$FONT_BOLD" -pointsize 52 -fill "$BURGUNDY" \
    -draw "text 176,113 'Vende'" \
    -fill "$GOLD_DARK" -draw "text 351,113 'T'" \
    -font "$FONT_BOLD" -pointsize 14 -fill '#5e5260' \
    -draw "text 178,137 'MARKETPLACE VENEZOLANO'" \
    "$TMP/header.png"

  convert "$ROOT/public/logo-vendet.webp" -resize 86x86 "$TMP/logo.png"
  convert "$TMP/header.png" "$TMP/logo.png" -geometry +70+54 -compose over -composite "$output"
}

add_flag_footer() {
  local input="$1"
  local output="$2"
  convert "$input" \
    -fill '#f4cf66' -draw 'rectangle 0,1332 360,1349' \
    -fill '#174ea6' -draw 'rectangle 360,1332 720,1349' \
    -fill '#cf142b' -draw 'rectangle 720,1332 1079,1349' \
    "$output"
}

render_flyer_01() {
  prepare_background "$HERE/assets/seller-woman.png" "$TMP/01-bg.png"
  add_brand_header "$TMP/01-bg.png" "$TMP/01-header.png"

  convert "$TMP/01-header.png" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.28)' -strokewidth 1 \
    -draw 'roundrectangle 70,186 442,234 24,24' \
    -stroke none -fill '#f4cf66' -draw 'roundrectangle 84,198 122,206 4,4' \
    -fill '#174ea6' -draw 'roundrectangle 84,206 122,214 4,4' \
    -fill '#cf142b' -draw 'roundrectangle 84,214 122,222 4,4' \
    -font "$FONT_BOLD" -pointsize 18 -fill white \
    -draw "text 136,217 'HECHO PARA VENEZUELA'" \
    -stroke '#23040c' -strokewidth 2 -font "$FONT_BOLD" \
    -pointsize 84 -fill white -draw "text 68,344 'ESO QUE'" \
    -pointsize 92 -fill "$GOLD" -draw "text 68,438 'NO USAS'" \
    -pointsize 82 -fill white -draw "text 68,532 'PUEDE SER'" \
    -pointsize 108 -fill "$GOLD" -draw "text 68,638 'PLATA.'" \
    -stroke none -font "$FONT_BOLD" -pointsize 32 -fill white \
    -draw "text 72,712 'Publícalo gratis en VendeT.'" \
    -font "$FONT_REG" -pointsize 27 -fill '#f4e9ed' \
    -draw "text 72,756 'Sin comisión. Tú recibes el 100%.'" \
    -fill 'rgba(255,255,255,0.95)' -draw 'roundrectangle 70,808 330,865 15,15' \
    -fill "$GREEN" -draw 'circle 99,836.5 113,836.5' \
    -stroke white -strokewidth 4 -fill none -draw 'polyline 92,837 97,842 107,830' \
    -stroke none -font "$FONT_BOLD" -pointsize 21 -fill "$INK" \
    -draw "text 123,844 'PUBLICAR: \$0'" \
    -fill 'rgba(255,255,255,0.95)' -draw 'roundrectangle 70,879 350,936 15,15' \
    -fill "$GREEN" -draw 'circle 99,907.5 113,907.5' \
    -stroke white -strokewidth 4 -fill none -draw 'polyline 92,908 97,913 107,901' \
    -stroke none -font "$FONT_BOLD" -pointsize 21 -fill "$INK" \
    -draw "text 123,915 'COMISIÓN: 0%'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 70,1047 518,1139 24,24' \
    -font "$FONT_BOLD" -pointsize 31 -fill '#4a1020' \
    -draw "text 140,1106 'PUBLICA HOY  →'" \
    -pointsize 39 -fill white -draw "text 72,1196 'vendet.online'" \
    -font "$FONT_REG" -pointsize 19 -fill '#e8dbe0' \
    -draw "text 73,1234 'Foto · precio · listo en menos de 2 minutos'" \
    "$TMP/01-drawn.png"

  # La pantalla fue generada intencionalmente en blanco: aquí insertamos la
  # marca real para evitar texto/logo deformado por el modelo de imagen.
  convert "$ROOT/public/logo-vendet.webp" -resize 48x48 "$TMP/phone-logo.png"
  convert "$TMP/01-drawn.png" "$TMP/phone-logo.png" -geometry +643+365 \
    -compose over -composite "$TMP/01-branded.png"

  add_flag_footer "$TMP/01-branded.png" "$HERE/flyer-01-plata.png"
}

render_flyer_02() {
  prepare_background "$HERE/assets/product-cluster.png" "$TMP/02-bg.png"
  add_brand_header "$TMP/02-bg.png" "$TMP/02-header.png"

  convert "$TMP/02-header.png" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.28)' -strokewidth 1 \
    -draw 'roundrectangle 70,187 428,233 23,23' \
    -stroke none -fill "$GOLD" -draw 'circle 96,210 104,210' \
    -font "$FONT_BOLD" -pointsize 17 -fill white \
    -draw "text 118,217 'COMPRA • VENDE • CONECTA'" \
    -stroke '#23040c' -strokewidth 2 -font "$FONT_BOLD" \
    -pointsize 82 -fill "$GOLD" -draw "text 67,336 'VENEZUELA'" \
    -pointsize 84 -fill white -draw "text 67,429 'YA TIENE'" \
    -pointsize 83 -fill white -draw "text 67,522 'SU PROPIO'" \
    -pointsize 67 -fill "$GOLD" -draw "text 67,608 'MARKETPLACE.'" \
    -stroke none -font "$FONT_BOLD" -pointsize 29 -fill white \
    -draw "text 71,684 'Compra y vende entre venezolanos.'" \
    -font "$FONT_REG" -pointsize 26 -fill '#f3e7eb' \
    -draw "text 71,725 'Directo, local y sin comisión.'" \
    -fill 'rgba(255,255,255,0.95)' -draw 'roundrectangle 70,783 356,837 15,15' \
    -fill "$BURGUNDY" -draw 'circle 98,810 111,810' \
    -stroke white -strokewidth 3.7 -fill none -draw 'polyline 91,810 96,815 106,803' \
    -stroke none -font "$FONT_BOLD" -pointsize 19 -fill "$INK" \
    -draw "text 121,817 'PRECIOS EN \$ + BS.'" \
    -fill 'rgba(255,255,255,0.95)' -draw 'roundrectangle 70,850 362,904 15,15' \
    -fill "$BURGUNDY" -draw 'circle 98,877 111,877' \
    -stroke white -strokewidth 3.7 -fill none -draw 'polyline 91,877 96,882 106,870' \
    -stroke none -font "$FONT_BOLD" -pointsize 19 -fill "$INK" \
    -draw "text 121,884 'CHAT + WHATSAPP'" \
    -fill 'rgba(255,255,255,0.95)' -draw 'roundrectangle 70,917 329,971 15,15' \
    -fill "$BURGUNDY" -draw 'circle 98,944 111,944' \
    -stroke white -strokewidth 3.7 -fill none -draw 'polyline 91,944 96,949 106,937' \
    -stroke none -font "$FONT_BOLD" -pointsize 19 -fill "$INK" \
    -draw "text 121,951 'TODO EL PAÍS'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 70,1058 466,1147 23,23' \
    -font "$FONT_BOLD" -pointsize 30 -fill '#4a1020' \
    -draw "text 122,1115 'ENTRA GRATIS  →'" \
    -pointsize 39 -fill white -draw "text 72,1203 'vendet.online'" \
    -font "$FONT_REG" -pointsize 18 -fill '#e8dbe0' \
    -draw "text 73,1241 'Publicar siempre es gratis · Destacar es opcional'" \
    "$TMP/02-drawn.png"

  add_flag_footer "$TMP/02-drawn.png" "$HERE/flyer-02-venezuela.png"
}

render_flyer_03() {
  prepare_background "$HERE/assets/photo-first-man.png" "$TMP/03-bg.png"
  add_brand_header "$TMP/03-bg.png" "$TMP/03-header.png"

  convert "$TMP/03-header.png" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.28)' -strokewidth 1 \
    -draw 'roundrectangle 70,187 424,233 23,23' \
    -stroke none -fill '#f4cf66' -draw 'roundrectangle 84,198 120,206 4,4' \
    -fill '#174ea6' -draw 'roundrectangle 84,206 120,214 4,4' \
    -fill '#cf142b' -draw 'roundrectangle 84,214 120,222 4,4' \
    -font "$FONT_BOLD" -pointsize 17 -fill white \
    -draw "text 133,217 'VENDE EN VENEZUELA'" \
    -stroke '#23040c' -strokewidth 2 -font "$FONT_BOLD" \
    -pointsize 116 -fill white -draw "text 66,354 'FOTO.'" \
    -pointsize 108 -fill "$GOLD" -draw "text 66,478 'PRECIO.'" \
    -pointsize 79 -fill white -draw "text 66,589 '¡PUBLICADO!'" \
    -stroke none -font "$FONT_BOLD" -pointsize 31 -fill white \
    -draw "text 71,680 'Tu anuncio listo en'" \
    -pointsize 33 -fill "$GOLD" -draw "text 71,724 'menos de 2 minutos.'" \
    -fill 'rgba(255,255,255,0.94)' -draw 'roundrectangle 70,784 506,946 23,23' \
    -fill "$GREEN" -draw 'circle 105,822 119,822' \
    -stroke white -strokewidth 4 -fill none -draw 'polyline 98,822 103,827 113,815' \
    -stroke none -font "$FONT_BOLD" -pointsize 18 -fill "$INK" \
    -draw "text 131,829 'PUBLICACIÓN GRATIS'" \
    -fill "$GREEN" -draw 'circle 105,865 119,865' \
    -stroke white -strokewidth 4 -fill none -draw 'polyline 98,865 103,870 113,858' \
    -stroke none -font "$FONT_BOLD" -pointsize 18 -fill "$INK" \
    -draw "text 131,872 '0% COMISIÓN POR VENTA'" \
    -fill "$GREEN" -draw 'circle 105,908 119,908' \
    -stroke white -strokewidth 4 -fill none -draw 'polyline 98,908 103,913 113,901' \
    -stroke none -font "$FONT_BOLD" -pointsize 18 -fill "$INK" \
    -draw "text 131,915 'CONTACTO DIRECTO'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 70,1038 454,1127 23,23' \
    -font "$FONT_BOLD" -pointsize 31 -fill '#4a1020' \
    -draw "text 125,1095 'VENDE HOY  →'" \
    -pointsize 39 -fill white -draw "text 72,1188 'vendet.online'" \
    -font "$FONT_REG" -pointsize 19 -fill '#e8dbe0' \
    -draw "text 73,1226 'Crea tu cuenta gratis y publica ahora'" \
    "$TMP/03-drawn.png"

  add_flag_footer "$TMP/03-drawn.png" "$HERE/flyer-03-rapido.png"
}

render_flyer_01
render_flyer_02
render_flyer_03

printf 'Flyers generados en %s\n' "$HERE"
identify "$HERE"/flyer-*.png

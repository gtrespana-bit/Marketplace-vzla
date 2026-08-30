#!/usr/bin/env bash
set -euo pipefail

# Segunda colección: conceptos publicitarios premium 04–10.
# Requiere ImageMagick. Los textos se dibujan con Inter (incluida en ./fonts)
# para mantener ortografía, kerning y nitidez exactos.

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

REG="$HERE/fonts/Inter-400.ttf"
SEMIBOLD="$HERE/fonts/Inter-600.ttf"
BOLD="$HERE/fonts/Inter-700.ttf"
BLACK="$HERE/fonts/Inter-900.ttf"

WINE="#711d34"
DARK="#22040d"
GOLD="#f1c95b"
GOLD_DARK="#c9a84c"
CREAM="#fff7e8"
GREEN="#25a66d"
BLUE="#174ea6"
RED="#cf142b"

prepare_bg() {
  local source="$1"
  local output="$2"
  local opacity="${3:-0.72}"
  local edge="${4:-585}"

  convert "$source" -resize '1080x1350^' -gravity center -extent 1080x1350 "$TMP/base.png"
  convert -size 1080x1350 xc:none \
    -fill "rgba(22,1,8,$opacity)" -draw "rectangle -140,-140 $edge,1490" \
    -blur 0x76 "$TMP/left.png"
  convert -size 1080x1350 xc:none \
    -fill 'rgba(12,1,5,0.66)' -draw 'rectangle -120,1245 1200,1480' \
    -blur 0x58 "$TMP/bottom.png"
  convert "$TMP/base.png" "$TMP/left.png" -compose over -composite \
    "$TMP/bottom.png" -compose over -composite "$output"
}

brand_pill() {
  local input="$1"
  local output="$2"
  convert "$input" \
    -fill 'rgba(255,255,255,0.97)' -stroke none \
    -draw 'roundrectangle 60,46 405,136 23,23' \
    -font "$BLACK" -pointsize 43 -kerning -1.5 -fill "$WINE" \
    -draw "text 154,105 'Vende'" \
    -fill "$GOLD_DARK" -draw "text 293,105 'T'" \
    -font "$BOLD" -pointsize 11 -kerning 1.7 -fill '#62555a' \
    -draw "text 156,126 'MARKETPLACE VENEZOLANO'" \
    "$TMP/brand-draw.png"
  convert "$ROOT/public/logo-vendet.webp" -resize 78x78 "$TMP/logo-small.png"
  convert "$TMP/brand-draw.png" "$TMP/logo-small.png" -geometry +66+52 -compose over -composite "$output"
}

brand_inline() {
  local input="$1"
  local output="$2"
  convert "$input" \
    -font "$BLACK" -pointsize 43 -kerning -1.5 -fill white \
    -draw "text 154,104 'Vende'" \
    -fill "$GOLD" -draw "text 293,104 'T'" \
    -font "$BOLD" -pointsize 11 -kerning 1.8 -fill 'rgba(255,255,255,0.70)' \
    -draw "text 156,126 'MARKETPLACE VENEZOLANO'" \
    -fill 'rgba(255,255,255,0.18)' -stroke 'rgba(255,255,255,0.28)' -strokewidth 1 \
    -draw 'roundrectangle 59,45 144,130 21,21' \
    "$TMP/brand-draw.png"
  convert "$ROOT/public/logo-vendet.webp" -resize 74x74 "$TMP/logo-small.png"
  convert "$TMP/brand-draw.png" "$TMP/logo-small.png" -geometry +65+51 -compose over -composite "$output"
}

footer_flag() {
  local input="$1"
  local output="$2"
  local height="${3:-12}"
  local y=$((1350-height))
  convert "$input" \
    -fill '#f4cf66' -draw "rectangle 0,$y 360,1349" \
    -fill "$BLUE" -draw "rectangle 360,$y 720,1349" \
    -fill "$RED" -draw "rectangle 720,$y 1079,1349" \
    "$output"
}

# 04 — Insight venezolano: la gaveta llena de cosas sin usar.
render_04() {
  prepare_bg "$HERE/assets/drawer-value.png" "$TMP/04-bg.png" 0.78 600
  brand_pill "$TMP/04-bg.png" "$TMP/04-brand.png"

  convert "$TMP/04-brand.png" \
    -font "$BOLD" -pointsize 16 -kerning 2.2 -fill "$GOLD" \
    -draw "text 68,204 'DINERO QUE YA TIENES'" \
    -stroke none -font "$BLACK" -kerning -3 \
    -pointsize 80 -fill white -draw "text 65,319 'ABRE ESA'" \
    -pointsize 96 -fill "$GOLD" -draw "text 65,420 'GAVETA.'" \
    -pointsize 71 -fill white -draw "text 65,510 'HAY PLATA'" \
    -pointsize 109 -fill "$GOLD" -draw "text 65,621 'AHÍ.'" \
    -stroke none -font "$SEMIBOLD" -kerning 0 -pointsize 27 -fill white \
    -draw "text 70,705 'Lo que no usas todavía tiene valor.'" \
    -font "$REG" -pointsize 23 -fill '#eadde1' \
    -draw "text 70,743 'Encuentra un comprador en VendeT.'" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.25)' -strokewidth 1 \
    -draw 'roundrectangle 69,798 481,866 18,18' \
    -stroke none -font "$BOLD" -pointsize 18 -kerning 0.5 -fill white \
    -draw "text 96,840 'PUBLICA GRATIS  ·  COMISIÓN 0%'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 69,1039 467,1132 24,24' \
    -font "$BLACK" -pointsize 27 -kerning 0 -fill '#46101e' \
    -draw "text 111,1098 'SÁCALO Y VÉNDELO  →'" \
    -font "$BLACK" -pointsize 38 -fill white -draw "text 70,1195 'vendet.online'" \
    -font "$REG" -pointsize 18 -fill '#e5d8dc' \
    -draw "text 71,1232 'Hecho para vender en Venezuela'" \
    "$TMP/04-draw.png"

  footer_flag "$TMP/04-draw.png" "$HERE/flyer-04-gaveta.png" 13
}

# 05 — Poster de comisión: lujo minimalista, una sola idea.
render_05() {
  prepare_bg "$HERE/assets/zero-sculpture.png" "$TMP/05-bg.png" 0.63 520
  brand_inline "$TMP/05-bg.png" "$TMP/05-brand.png"

  convert "$TMP/05-brand.png" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.25)' -strokewidth 1 \
    -draw 'roundrectangle 66,174 388,220 23,23' \
    -stroke none -font "$BOLD" -pointsize 15 -kerning 1.7 -fill white \
    -draw "text 91,204 'SIN LETRA PEQUEÑA'" \
    -stroke none -font "$BLACK" -kerning -4 \
    -pointsize 148 -fill "$GOLD" -draw "text 58,381 '0%'" \
    -pointsize 48 -kerning -1.5 -fill white -draw "text 67,450 'PARA NOSOTROS.'" \
    -stroke none -fill "$GOLD_DARK" -draw 'rectangle 68,485 431,492' \
    -stroke none -font "$BLACK" -kerning -3 \
    -pointsize 111 -fill white -draw "text 59,625 '100%'" \
    -pointsize 68 -fill "$GOLD" -draw "text 65,704 'PARA TI.'" \
    -stroke none -font "$SEMIBOLD" -kerning 0 -pointsize 28 -fill white \
    -draw "text 70,783 'Vendes directo.'" \
    -draw "text 70,821 'Te quedas con todo.'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 68,1026 422,1116 23,23' \
    -font "$BLACK" -pointsize 29 -fill '#46101e' \
    -draw "text 124,1084 'PUBLICA GRATIS  →'" \
    -font "$BLACK" -pointsize 38 -fill white -draw "text 70,1184 'vendet.online'" \
    -font "$REG" -pointsize 18 -fill '#e5d8dc' \
    -draw "text 71,1222 '0% de comisión por venta · Venezuela'" \
    "$TMP/05-draw.png"

  footer_flag "$TMP/05-draw.png" "$HERE/flyer-05-cero-comision.png" 10
}

# 06 — Contraste con contenidos efímeros sin nombrar competidores.
render_06() {
  prepare_bg "$HERE/assets/hourglass-listing.png" "$TMP/06-bg.png" 0.71 590
  brand_pill "$TMP/06-bg.png" "$TMP/06-brand.png"

  convert "$TMP/06-brand.png" \
    -font "$BOLD" -pointsize 16 -kerning 2 -fill "$GOLD" \
    -draw "text 69,205 'TU VENTA NECESITA TIEMPO'" \
    -stroke none -font "$BLACK" -kerning -3 \
    -pointsize 89 -fill "$GOLD" -draw "text 63,337 '24 HORAS'" \
    -pointsize 85 -fill white -draw "text 64,432 'NO BASTAN.'" \
    -stroke none -font "$SEMIBOLD" -kerning 0 -pointsize 28 -fill white \
    -draw "text 69,514 'Publica donde tu anuncio'" \
    -draw "text 69,554 'sigue trabajando.'" \
    -font "$REG" -pointsize 23 -fill '#eadde1' \
    -draw "text 69,611 'Visible hasta que encuentres comprador.'" \
    -fill 'rgba(255,255,255,0.95)' -draw 'roundrectangle 68,686 484,830 22,22' \
    -fill "$WINE" -draw 'circle 106,731 122,731' \
    -stroke white -strokewidth 4 -fill none -draw 'polyline 98,731 104,737 116,722' \
    -stroke none -font "$BOLD" -pointsize 19 -fill '#35101a' \
    -draw "text 137,738 'PUBLICACIÓN GRATIS'" \
    -fill "$WINE" -draw 'circle 106,784 122,784' \
    -stroke white -strokewidth 4 -fill none -draw 'polyline 98,784 104,790 116,775' \
    -stroke none -font "$BOLD" -pointsize 19 -fill '#35101a' \
    -draw "text 137,791 'RENUEVA GRATIS CADA 7 DÍAS'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 68,1029 414,1119 23,23' \
    -font "$BLACK" -pointsize 28 -fill '#46101e' \
    -draw "text 112,1087 'DALE MÁS VIDA  →'" \
    -font "$BLACK" -pointsize 38 -fill white -draw "text 70,1186 'vendet.online'" \
    -font "$REG" -pointsize 18 -fill '#e5d8dc' \
    -draw "text 71,1224 'Tu anuncio merece encontrar comprador'" \
    "$TMP/06-draw.png"

  footer_flag "$TMP/06-draw.png" "$HERE/flyer-06-mas-de-24-horas.png" 13
}

# 07 — El anuncio como vendedor que permanece visible de noche.
render_07() {
  prepare_bg "$HERE/assets/night-storefront.png" "$TMP/07-bg.png" 0.74 585
  brand_inline "$TMP/07-bg.png" "$TMP/07-brand.png"

  convert "$TMP/07-brand.png" \
    -fill 'rgba(32,166,105,0.18)' -stroke 'rgba(83,230,166,0.55)' -strokewidth 1 \
    -draw 'roundrectangle 66,177 285,225 24,24' \
    -stroke none -fill '#39d98a' -draw 'circle 93,201 101,201' \
    -font "$BOLD" -pointsize 16 -kerning 1.5 -fill '#c9ffe7' \
    -draw "text 117,208 'VISIBLE 24/7'" \
    -stroke none -font "$BLACK" -kerning -3 \
    -pointsize 76 -fill white -draw "text 64,340 'TU ANUNCIO'" \
    -pointsize 91 -fill "$GOLD" -draw "text 63,440 'NO DUERME.'" \
    -stroke none -font "$SEMIBOLD" -kerning 0 -pointsize 28 -fill white \
    -draw "text 69,526 'Sigue visible mientras tú'" \
    -draw "text 69,566 'sigues con tu día.'" \
    -font "$REG" -pointsize 22 -fill '#dfe7f4' \
    -draw "text 69,625 'Los mensajes te esperan al volver.'" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.24)' -strokewidth 1 \
    -draw 'roundrectangle 68,692 483,818 22,22' \
    -stroke none -font "$BOLD" -pointsize 17 -kerning 1.3 -fill "$GOLD" \
    -draw "text 96,730 'PUBLICA UNA VEZ'" \
    -font "$SEMIBOLD" -pointsize 22 -kerning 0 -fill white \
    -draw "text 96,772 'Tu vitrina queda abierta'" \
    -draw "text 96,801 'para toda Venezuela.'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 68,1026 464,1117 23,23' \
    -font "$BLACK" -pointsize 27 -fill '#46101e' \
    -draw "text 107,1085 'PONLO A TRABAJAR  →'" \
    -font "$BLACK" -pointsize 38 -fill white -draw "text 70,1185 'vendet.online'" \
    -font "$REG" -pointsize 18 -fill '#dce2ee' \
    -draw "text 71,1223 'Publica gratis · Sin comisión'" \
    "$TMP/07-draw.png"

  footer_flag "$TMP/07-draw.png" "$HERE/flyer-07-no-duerme.png" 10
}

# 08 — Demostración concreta del 0% de comisión.
render_08() {
  prepare_bg "$HERE/assets/direct-exchange.png" "$TMP/08-bg.png" 0.78 615
  brand_pill "$TMP/08-bg.png" "$TMP/08-brand.png"

  convert "$TMP/08-brand.png" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.26)' -strokewidth 1 \
    -draw 'roundrectangle 67,176 337,224 24,24' \
    -stroke none -font "$BOLD" -pointsize 15 -kerning 1.8 -fill white \
    -draw "text 93,207 'ASÍ FUNCIONA EL 0%'" \
    -stroke none -font "$BLACK" -kerning -3 \
    -pointsize 53 -fill white -draw "text 67,322 'VENDES EN'" \
    -pointsize 123 -fill "$GOLD" -draw "text 61,447 '\$120.'" \
    -pointsize 53 -fill white -draw "text 67,527 'RECIBES'" \
    -pointsize 123 -fill "$GOLD" -draw "text 61,653 '\$120.'" \
    -stroke none -font "$SEMIBOLD" -kerning 0 -pointsize 29 -fill white \
    -draw "text 70,731 'VendeT cobra \$0 por tu venta.'" \
    -font "$REG" -pointsize 22 -fill '#eadde1' \
    -draw "text 70,773 'El pago se acuerda directo.'" \
    -fill 'rgba(255,255,255,0.95)' -draw 'roundrectangle 69,831 425,899 18,18' \
    -font "$BLACK" -pointsize 20 -kerning 0.7 -fill "$WINE" \
    -draw "text 101,873 'TÚ TE QUEDAS CON TODO'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 69,1032 421,1122 23,23' \
    -font "$BLACK" -pointsize 29 -kerning 0 -fill '#46101e' \
    -draw "text 122,1090 'VENDE DIRECTO  →'" \
    -font "$BLACK" -pointsize 38 -fill white -draw "text 70,1190 'vendet.online'" \
    -font "$REG" -pointsize 18 -fill '#e5d8dc' \
    -draw "text 71,1228 'Publicar es gratis · Venezuela'" \
    "$TMP/08-draw.png"

  footer_flag "$TMP/08-draw.png" "$HERE/flyer-08-recibes-lo-mismo.png" 13
}

# 09 — Demanda/retención: búsquedas guardadas con alertas.
render_09() {
  prepare_bg "$HERE/assets/search-alert.png" "$TMP/09-bg.png" 0.76 600
  brand_pill "$TMP/09-bg.png" "$TMP/09-brand.png"

  convert "$TMP/09-brand.png" \
    -font "$BOLD" -pointsize 16 -kerning 2 -fill "$GOLD" \
    -draw "text 69,204 'PARA QUIEN ESTÁ BUSCANDO'" \
    -stroke none -font "$BLACK" -kerning -3 \
    -pointsize 83 -fill white -draw "text 63,329 '¿NO ESTÁ?'" \
    -pointsize 69 -fill "$GOLD" -draw "text 64,414 'TE AVISAMOS'" \
    -pointsize 67 -fill white -draw "text 64,495 'CUANDO'" \
    -pointsize 69 -fill "$GOLD" -draw "text 64,578 'APAREZCA.'" \
    -stroke none -font "$REG" -kerning 0 -pointsize 24 -fill '#eee3e7' \
    -draw "text 69,640 'Guarda tu búsqueda gratis.'" \
    -fill 'rgba(255,255,255,0.96)' -stroke none \
    -draw 'roundrectangle 68,692 523,850 24,24' \
    -fill "$WINE" -draw 'circle 111,752 139,752' \
    -stroke white -strokewidth 4 -fill none \
    -draw 'circle 111,748 120,748' -draw 'line 117,755 124,763' \
    -stroke none -font "$BOLD" -pointsize 14 -kerning 1.3 -fill '#87606b' \
    -draw "text 157,731 'BÚSQUEDA GUARDADA'" \
    -font "$BOLD" -pointsize 22 -kerning 0 -fill '#32101a' \
    -draw "text 157,766 'Te avisaremos cuando'" \
    -draw "text 157,797 'haya publicaciones nuevas.'" \
    -font "$REG" -pointsize 17 -fill '#755b63' \
    -draw "text 100,828 'Celulares · motos · repuestos · y más'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 68,1033 448,1123 23,23' \
    -font "$BLACK" -pointsize 27 -fill '#46101e' \
    -draw "text 108,1091 'ACTIVA TU ALERTA  →'" \
    -font "$BLACK" -pointsize 36 -fill white -draw "text 70,1191 'vendet.online/buscar'" \
    -font "$REG" -pointsize 18 -fill '#e5d8dc' \
    -draw "text 71,1229 'Nuevas publicaciones directo a ti'" \
    "$TMP/09-draw.png"

  footer_flag "$TMP/09-draw.png" "$HERE/flyer-09-te-avisamos.png" 13
}

# 10 — Awareness: amplitud del marketplace en un solo portal.
render_10() {
  prepare_bg "$HERE/assets/phone-portal.png" "$TMP/10-bg.png" 0.71 580
  brand_inline "$TMP/10-bg.png" "$TMP/10-brand.png"

  convert "$TMP/10-brand.png" \
    -fill 'rgba(255,255,255,0.10)' -stroke 'rgba(255,255,255,0.26)' -strokewidth 1 \
    -draw 'roundrectangle 66,173 343,219 23,23' \
    -stroke none -font "$BOLD" -pointsize 15 -kerning 1.7 -fill white \
    -draw "text 91,203 'SOLO VENEZUELA'" \
    -fill '#f4cf66' -draw 'roundrectangle 258,187 280,192 2,2' \
    -fill "$BLUE" -draw 'roundrectangle 280,187 302,192 2,2' \
    -fill "$RED" -draw 'roundrectangle 302,187 324,192 2,2' \
    -stroke none -font "$BLACK" -kerning -3 \
    -pointsize 67 -fill white -draw "text 64,320 'TODO LO QUE'" \
    -pointsize 95 -fill "$GOLD" -draw "text 63,420 'VENDES.'" \
    -pointsize 67 -fill white -draw "text 64,507 'TODO LO QUE'" \
    -pointsize 95 -fill "$GOLD" -draw "text 63,608 'BUSCAS.'" \
    -stroke none -font "$BLACK" -kerning 0 -pointsize 29 -fill white \
    -draw "text 69,684 'EN UN SOLO LUGAR.'" \
    -font "$REG" -pointsize 23 -fill '#e9dce1' \
    -draw "text 69,726 'Compra, vende y contacta directo.'" \
    -fill 'rgba(255,255,255,0.94)' -draw 'roundrectangle 68,786 279,838 16,16' \
    -fill 'rgba(255,255,255,0.94)' -draw 'roundrectangle 292,786 483,838 16,16' \
    -fill 'rgba(255,255,255,0.94)' -draw 'roundrectangle 68,850 259,902 16,16' \
    -fill 'rgba(255,255,255,0.94)' -draw 'roundrectangle 272,850 470,902 16,16' \
    -font "$BOLD" -pointsize 16 -fill '#38111c' \
    -draw "text 97,819 'TECNOLOGÍA'" \
    -draw "text 326,819 'VEHÍCULOS'" \
    -draw "text 113,883 'HOGAR'" \
    -draw "text 305,883 'Y MUCHO MÁS'" \
    -fill "$GOLD_DARK" -draw 'roundrectangle 68,1031 496,1122 23,23' \
    -font "$BLACK" -pointsize 27 -fill '#46101e' \
    -draw "text 109,1090 'ENTRA AL MARKETPLACE  →'" \
    -font "$BLACK" -pointsize 38 -fill white -draw "text 70,1190 'vendet.online'" \
    -font "$REG" -pointsize 18 -fill '#e5d8dc' \
    -draw "text 71,1228 'Publica gratis · Compra mejor'" \
    "$TMP/10-draw.png"

  footer_flag "$TMP/10-draw.png" "$HERE/flyer-10-todo-en-un-lugar.png" 13
}

render_04
render_05
render_06
render_07
render_08
render_09
render_10

printf 'Colección premium generada en %s\n' "$HERE"
identify "$HERE"/flyer-{04,05,06,07,08,09,10}-*.png

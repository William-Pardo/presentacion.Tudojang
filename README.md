# TuDojang × Gajog — Presentación para familias

Presentación cinematográfica de scroll horizontal para la inducción de TuDojang a los
padres de familia del Gajog Club de Taekwondo. Sitio estático, sin dependencias
externas (HTML + CSS + JS vainilla), listo para GitHub Pages.

## Estructura

```
index.html                     Estructura de las 13 slides (paneles)
styles.css                     Todo el diseño visual (paleta, tipografía, motor de scroll)
script.js                      Motor de scroll horizontal + navegación + fallback de imágenes
GUION_NARRATIVA.md             Guion completo palabra por palabra para el presentador
assets/
  ima-presentacion/            Imágenes generadas por IA (ChatGPT/DALL-E) para los paneles narrativos
  video-demo/                  Material real (capturas/videos) usado en el panel "Por qué"
```

## Cómo agregar una imagen generada por IA

1. Generá la imagen con el prompt correspondiente (están en `GUION_NARRATIVA.md`)
2. Guardala en `assets/ima-presentacion/` con el nombre exacto que espera `index.html`
   (por ejemplo `panel-01-hero-bienvenida.png`)
3. Recargá `index.html` en el navegador — no hace falta tocar código

## Paneles pendientes de imagen

| Archivo esperado | Panel |
|---|---|
| `assets/ima-presentacion/panel-01-hero-bienvenida.png` | 01 — Bienvenida |
| `assets/ima-presentacion/panel-04-viaje-familia.png` | 04 — El viaje de una familia |
| `assets/ima-presentacion/panel-11-proximos-pasos.png` | 11 — Próximos pasos |

## Demostraciones en vivo (paneles 5–9)

Estos paneles incrustan la app real (`tudojang.com`) en un iframe. Si no carga en el
navegador del presentador (por partición de almacenamiento de terceros en navegadores
modernos), usar Alt-Tab a una pestaña donde ya se inició sesión en TuDojang como
respaldo — ver notas en `GUION_NARRATIVA.md`.

## Publicar en GitHub Pages

```bash
git remote add origin <url-del-repo>
git push -u origin main
```

Luego activar GitHub Pages en Settings → Pages → Branch: `main` → `/ (root)`.

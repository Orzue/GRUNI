# GRUNI

Sitio institucional y comercial de GRUNI, un estudio de mejora operativa y tecnología aplicada. La landing está pensada para explicar qué problemas resuelve la empresa, qué servicios ofrece, cómo trabaja y cómo iniciar una consulta comercial.

## Estructura

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
├── robots.txt
├── sitemap.xml
└── assets/
    ├── icons/
    └── images/
        ├── favicon.svg
        ├── apple-touch-icon.png
        ├── process-map.png
        └── social-preview.png
```

- `index.html`: contenido semántico, navegación, secciones comerciales, metadatos SEO y JSON-LD.
- `styles.css`: identidad visual, layout responsive, estados de foco, menú móvil, FAQ y animaciones progresivas.
- `script.js`: menú accesible, header al hacer scroll, acordeones, validación del formulario, `mailto:` y año dinámico.
- `robots.txt`: reglas básicas para crawlers.
- `sitemap.xml`: sitemap inicial de una sola página.
- `assets/images/`: favicon, icono Apple Touch, imagen social y fondo visual del hero.
- `assets/icons/`: carpeta preparada para futuros iconos externos si se decide mover la iconografía fuera del HTML.

## Ejecución local

Podés abrir `index.html` directamente en el navegador. Para probarlo como sitio estático local, ejecutá:

```bash
python3 -m http.server 8000
```

Luego entrá a:

```text
http://localhost:8000
```

## Publicación en Vercel

1. Crear un repositorio Git.
2. Subir estos archivos al repositorio.
3. Importar el proyecto desde Vercel.
4. No seleccionar framework.
5. Mantener la configuración estática por defecto.
6. Publicar.

No hace falta configurar build command ni output directory.

## Personalización

Antes de publicar, revisar y reemplazar si corresponde:

- Email de contacto: `gruni.auth@gmail.com`.
- LinkedIn: `https://www.linkedin.com/in/gonzalezkj/`.
- URL oficial: `https://www.gruni.com.ar/` en `index.html`, `robots.txt` y `sitemap.xml`.
- Metadatos Open Graph y Twitter Card en `index.html`.
- Imagen social: `assets/images/social-preview.png`.
- Fotografía profesional de Kevin: reemplazar el placeholder visual de la tarjeta del fundador.
- Textos comerciales: editar las secciones directamente en `index.html`.
- Futuros casos reales: convertir las tarjetas de "Soluciones aplicadas a problemas reales" en enlaces a casos cuando existan datos reales.

## Formulario

El formulario funciona con `mailto:`. Al enviar:

1. Valida los campos obligatorios.
2. Construye el asunto del correo.
3. Construye un cuerpo ordenado con los datos.
4. Intenta abrir el cliente de correo del usuario.
5. Muestra un enlace alternativo si el cliente de correo no se abre.

Para una integración posterior, reemplazar el bloque indicado en `script.js` por Formspree, Resend, EmailJS, una API propia o una función serverless.

## Futuras páginas previstas

La arquitectura puede ampliarse con:

```text
/casos/
/casos/index.html
/casos/nombre-del-caso.html
/privacidad/
/terminos/
```

No se incluyen casos, testimonios, métricas, clientes, premios ni certificaciones ficticias.

# Janoppix - url-capture

Servicio en NestJS que recibe una URL y genera una captura del sitio web en modo desktop o mobile (solo el viewport visible). Las capturas se guardan temporalmente en disco y se exponen como imágenes accesibles por URL.

## 🚀 Características

- Captura on-demand usando Puppeteer
- Soporte para vista **desktop (1366x768)** y **mobile (375x812)**
- Archivos guardados en `public/screenshots/` con nombre basado en UUID
- Endpoint único con parámetros de URL
- Cron job que elimina capturas de más de 2 días

## 🧱 Tech stack

- NestJS
- Puppeteer
- @nestjs/schedule (cron interno)
- UUID
- Node.js

## 📦 Instalación

```bash
npm install
```

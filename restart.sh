#!/bin/bash

APP_NAME="captura"
ENTRY_FILE="dist/main.js"

echo "🗑️  Borrando procesos PM2 existentes..."
pm2 delete all

echo "🧹 Limpiando procesos y deteniendo PM2..."
pm2 kill

echo "🔨 Construyendo el proyecto NestJS..."
npm run build

echo "🚀 Iniciando nueva instancia con PM2..."
pm2 start $ENTRY_FILE --name $APP_NAME

echo "💾 Guardando configuración PM2..."
pm2 save

echo "✅ Despliegue completado. Estado actual:"
pm2 list

# 🔐 Guía Completa de Variables de Entorno

## 📋 Resumen

Esta guía detalla cómo configurar correctamente las variables de entorno para garantizar la seguridad y funcionalidad de la aplicación Santi's E-commerce.

## 🚨 Principios de Seguridad

### ✅ Variables Públicas (NEXT_PUBLIC_*)
- **Se incluyen en el bundle del cliente**
- **Visibles en el navegador**
- **Usar solo para configuración no sensible**

### 🔒 Variables Privadas (sin prefijo)
- **Solo disponibles en el servidor**
- **Nunca se envían al cliente**
- **Usar para datos sensibles como claves secretas**

## 📁 Estructura de Archivos

\`\`\`
proyecto/
├── .env.local.example     # Plantilla con ejemplos
├── .env.local            # Tu configuración real (NO subir a Git)
├── .gitignore            # Incluye .env.local
└── docs/
    └── ENVIRONMENT_SETUP.md
\`\`\`

## 🔧 Configuración Paso a Paso

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Sigue el asistente de configuración
4. Habilita **Authentication** y **Firestore Database**

### 2. Obtener Credenciales

1. En Firebase Console, ve a **⚙️ Configuración del proyecto**
2. Scroll hasta **"Tus aplicaciones"**
3. Haz clic en **"Aplicación web"** (ícono `</>`
4. Registra tu aplicación
5. Copia la configuración mostrada

### 3. Configurar Variables de Entorno

1. **Copia el archivo de ejemplo:**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. **Edita `.env.local` con tus valores reales:**
   \`\`\`env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC_tu_api_key_real
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   
   # WhatsApp (opcional)
   NEXT_PUBLIC_WHATSAPP_NUMBER=5491112345678
   \`\`\`

### 4. Verificar Configuración

1. **Reinicia el servidor de desarrollo:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Verifica en la consola del navegador:**
   - No deben aparecer errores de Firebase
   - La aplicación debe conectarse correctamente

## 🛡️ Mejores Prácticas de Seguridad

### ✅ Hacer

- **Usar `.env.local`** para desarrollo local
- **Usar variables de entorno del hosting** para producción
- **Rotar claves regularmente**
- **Limitar permisos de Firebase** con reglas de seguridad
- **Validar variables** en tiempo de ejecución

### ❌ No Hacer

- **Nunca subir `.env.local` a Git**
- **No hardcodear credenciales** en el código
- **No usar variables públicas** para datos sensibles
- **No compartir credenciales** por medios inseguros

## 🔐 Configuración de Producción

### Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings > Environment Variables**
3. Agrega cada variable individualmente:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY = tu_valor
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = tu_valor
   # ... etc
   \`\`\`

### Netlify

1. **Site settings > Environment variables**
2. Agrega las variables una por una
3. Redeploy el sitio

### Otros Hostings

Consulta la documentación específica de tu proveedor para configurar variables de entorno.

## 🔍 Validación y Debug

### Verificar Variables Cargadas

\`\`\`javascript
// En la consola del navegador
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurado' : '❌ Faltante',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Configurado' : '❌ Faltante',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Faltante',
  // ... etc
})
\`\`\`

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Firebase not configured` | Variables faltantes | Verificar `.env.local` |
| `Invalid API key` | API key incorrecta | Regenerar en Firebase Console |
| `Project not found` | Project ID incorrecto | Verificar ID del proyecto |
| `Permission denied` | Reglas de seguridad | Configurar reglas de Firestore |

## 📱 Variables Específicas

### Firebase Authentication
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=proyecto-id
\`\`\`

### Firebase Firestore & Storage
\`\`\`env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
\`\`\`

### WhatsApp Integration
\`\`\`env
# Formato: código_país + número (sin espacios ni símbolos)
# Ejemplo: +54 9 11 1234-5678 → 5491112345678
NEXT_PUBLIC_WHATSAPP_NUMBER=5491112345678
\`\`\`

## 🔄 Rotación de Credenciales

### Cuándo Rotar
- **Cada 90 días** (recomendado)
- **Después de una brecha de seguridad**
- **Cuando un desarrollador deja el equipo**
- **Si las credenciales se exponen accidentalmente**

### Cómo Rotar
1. **Generar nuevas credenciales** en Firebase Console
2. **Actualizar variables de entorno** en todos los ambientes
3. **Redeploy** la aplicación
4. **Revocar credenciales antiguas**
5. **Verificar** que todo funciona correctamente

## 📞 Soporte

Si tienes problemas con la configuración:

1. **Verifica** que todas las variables estén configuradas
2. **Consulta** los logs de la consola del navegador
3. **Revisa** la documentación de Firebase
4. **Contacta** al equipo de desarrollo

---

**⚠️ Recordatorio:** Mantén siempre tus credenciales seguras y nunca las compartas públicamente.

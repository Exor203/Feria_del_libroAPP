# Etapa 1 — Base de datos local y configuración para principiantes

## Objetivo de esta etapa

Tener una app móvil que muestre contenido de ejemplo sin depender de internet: libros, eventos, artistas y un mapa de referencia. Al finalizar, la misma estructura se conectará con Firebase para sincronizar datos reales.

## Decisiones tomadas

- La app se construye con React Native y Expo: permite generar Android e iOS con una sola base de código.
- Firebase será la fuente oficial de datos compartidos y Firestore mantendrá una copia local para uso offline.
- El asistente IA usará Gemini Developer API gratis a través de Firebase AI Logic.
- El uso gratis tiene límites de solicitudes; se aplicará un límite por persona y mensajes cortos. Consultar siempre las cuotas actuales antes de publicar.

## Paso 1 — Instalar herramientas (una sola vez)

1. Instalar [Node.js LTS](https://nodejs.org/). Elegir la versión marcada como LTS.
2. Instalar la aplicación **Expo Go** en el teléfono Android o iPhone.
3. Crear una cuenta de Google exclusiva del proyecto o usar una cuenta de organización.
4. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/) con el nombre `Feria del Libro`.

## Paso 2 — Crear Firebase sin costo inicial

1. Dentro del proyecto Firebase, activar **Authentication** y habilitar correo/contraseña.
2. Crear **Cloud Firestore** en modo producción y seleccionar una región cercana al público objetivo.
3. Activar **Storage** solo cuando existan portadas y fotos definitivas.
4. En la consola de Firebase, registrar una aplicación web. Copiar su configuración pública cuando se solicite durante la Etapa 2.
5. Mantener las reglas de Firestore restrictivas: visitantes leen contenido público; solo administradores editan stock, agenda y anuncios.

## Paso 3 — Activar Gemini con seguridad

1. Abrir [Google AI Studio](https://aistudio.google.com/) y crear una clave del proyecto.
2. Usar la clave mediante Firebase AI Logic; no pegarla en archivos de la app, capturas ni repositorios.
3. Mantener el proyecto en el nivel gratuito mientras se prueba. Google indica que las cuentas nuevas comienzan en Free Tier y que existen límites por modelo y solicitudes.
4. Configurar un límite de mensajes por usuario y una respuesta de respaldo cuando la cuota se termine.

## Paso 4 — Qué se implementa ahora

1. Estructura de la aplicación y datos de demostración locales.
2. Pantalla de catálogo, agenda, artistas y mapa estático usando esos datos.
3. Sincronización con Firebase en la siguiente etapa, sin cambiar la experiencia visual.

### Estado actual de la implementación

- Se creó `mobile/src/types/content.ts`: define los datos que la app entiende.
- Se creó `mobile/src/data/catalogoInicial.ts`: contiene contenido de demostración local; debe reemplazarse por información confirmada de la feria.
- Se creó `mobile/src/services/localContentRepository.ts`: ofrece búsqueda y disponibilidad con una única interfaz reutilizable por las pantallas.
- Se creó la aplicación Expo en `mobile/` y se verificó TypeScript sin errores.
- Node LTS y `npm` ya están instalados en el equipo.

## Cómo abrir la app en el teléfono

1. Abrir una consola dentro de la carpeta `mobile`.
2. En PowerShell, ejecutar `& "C:\Program Files\nodejs\npm.cmd" start`. Esta forma evita el bloqueo de `npm.ps1` sin cambiar la política de seguridad de Windows.
3. Abrir Expo Go en el teléfono conectado a la misma red Wi-Fi.
4. Escanear el código QR mostrado por Expo.

### Si se prefiere usar `npm start`

En esa misma ventana de PowerShell, ejecutar primero `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` y luego `npm start`. El cambio es temporal: desaparece al cerrar la ventana y no modifica la política global del equipo.

## Información que se necesitará después

- Lista de libros, autor, sinopsis, géneros, portada y stand.
- Plano oficial del predio y nombres de puntos de interés.
- Agenda confirmada, artistas y anuncios iniciales.
- Nombre y correo de quienes administrarán el contenido.

## Referencias oficiales

- [Inicio de Gemini API](https://ai.google.dev/gemini-api/docs/get-started)
- [Claves y seguridad de Gemini](https://ai.google.dev/gemini-api/docs/api-key)
- [Nivel gratuito de Firebase AI Logic](https://firebase.google.com/docs/ai-logic/pricing)
- [Precios y cuotas de Gemini](https://ai.google.dev/gemini-api/docs/pricing)

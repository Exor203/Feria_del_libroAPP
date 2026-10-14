# Prueba local del chat con IA

El chat puede probarse en Expo Go (Android/iOS) mediante un servidor Node.js en la notebook. El servidor consulta Gemini Developer API con la clave privada de `server/.env`; la app nunca recibe esa clave. Esta ruta de prueba fue solicitada por el usuario para evitar reCAPTCHA y facturación. Firebase AI Logic queda como alternativa pendiente de App Check.

## Configuración

1. Instalar las dependencias de `mobile` y usar Node.js 22.13 o posterior.
2. Copiar `server/.env.example` como `server/.env`; completar `GEMINI_API_KEY`, `GEMINI_MODEL`, `PORT` y un `LOCAL_CHAT_TOKEN` aleatorio privado para esta prueba.
3. En `mobile/.env`, configurar `EXPO_PUBLIC_ASSISTANT_MODE=local`, `EXPO_PUBLIC_ASSISTANT_URL=http://IP_DE_LA_NOTEBOOK:8787` y `EXPO_PUBLIC_LOCAL_CHAT_TOKEN` con el mismo token del servidor. Este token identifica al cliente local de prueba; no es la clave de Gemini.
4. Desde la raíz del proyecto ejecutar `node server/server.cjs` y mantener la consola abierta.
5. Desde `mobile`, ejecutar Expo. Notebook y teléfono deben estar en la misma Wi-Fi. Abrir la app y elegir Asistente en el menú del libro.

El servidor compila al iniciar la política y el catálogo desde el código de la app, usando TypeScript instalado en `mobile`. El contexto generado en `server/.generated` está excluido de Git. Si cambia el catálogo, reiniciar el servidor.

## Comportamiento

- Conversación con las últimas seis parejas completas de mensajes.
- Catálogo, stock, eventos y ubicaciones identificados como datos de demostración.
- No se envían al modelo el nombre, correo ni contraseña del login.
- Mensajes de hasta 600 caracteres. El servidor valida tamaño y forma del historial.
- Hasta 20 solicitudes por hora para el servidor local, una por vez, con espera mínima de tres segundos.
- Errores de cuota, conexión y servicio se muestran sin revelar la clave. El usuario puede reintentar y consultar Libros o Agenda.
- La ruta local solo se usa en modo desarrollo. Requiere la notebook encendida y no constituye un backend de producción.

## Estado comprobado el 14/10/2026

Se recibieron dos respuestas reales de Gemini: disponibilidad de El Eternauta y una pregunta de seguimiento. Ambas identificaron el stock como ejemplo. Se observaron errores temporales HTTP 503 y demoras con Gemini 3.8 Flash; quedaron manejados con reintento. Se eligió Gemini 3.5 Flash-Lite y se verificó una conversación completa mediante el mismo cliente usado por la app. El tiempo de espera es de 45 segundos en el servidor y 50 en el cliente.

## Pendiente para producción

El login todavía es de demostración. Para publicar se necesita un backend alojado, autenticación real, HTTPS y controles de acceso y cuotas. La ruta Firebase AI Logic requiere finalizar App Check con los proveedores apropiados para la app publicada.

## Referencias

- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/text-generation
- https://ai.google.dev/gemini-api/docs/pricing

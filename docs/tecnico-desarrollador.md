# Feria del Libro — propuesta técnica del MVP

## Alcance

Aplicación mobile de consulta durante la feria. El MVP se compone de autenticación, catálogo de libros, detalle y disponibilidad, agenda/anuncios, mapa estático e información de artistas. El intercambio y la IA quedan acotados para evitar complejidad operativa temprana.

## Arquitectura recomendada

- Cliente: React Native con Expo y TypeScript.
- Backend: Firebase (Authentication, Cloud Firestore, Storage y Firebase AI Logic).
- Panel de operación: web mínima para personal de feria; administra inventario, agenda, anuncios, mapa y artistas.
- Analítica: eventos anónimos de búsquedas, fichas vistas y consultas sin resultado.

## Módulos MVP

1. Autenticación: registro, inicio de sesión y recuperación de contraseña. Google es opcional, no requisito inicial.
2. Catálogo: búsqueda, filtro por género y estado de disponibilidad. Cada libro muestra portada, sinopsis y ubicación/stand.
3. Eventos: agenda por día y detalle. Anuncios publicados desde el panel.
4. Mapa: imagen/vector estático con leyenda y puntos de interés principales.
5. Artistas: listado y ficha biográfica.
6. Asistente: acceso global; inicialmente responde preguntas frecuentes y deriva a búsqueda de libros. No debe inventar stock.

## Datos mínimos

Colecciones Firestore: `books`, `inventory`, `stands`, `events`, `announcements`, `artists`, `venues`, `map_points`, `users` y `faq`. El stock se actualiza por libro y stand, con fecha de última actualización visible al usuario.

## Integración Gemini

La IA se integra mediante Firebase AI Logic con Gemini Developer API en nivel gratuito. La aplicación nunca llama a Gemini con una clave incluida en el código. El backend/servicio AI recibe el contexto oficial mínimo y puede responder preguntas frecuentes o sugerir libros; para disponibilidad debe consultar `inventory` antes de responder.

## Criterios de aceptación esenciales

- Un visitante encuentra un libro por título, autor o género y ve disponibilidad y stand.
- Un visitante consulta la agenda de un día y abre un anuncio.
- Un visitante ubica auditorios, stands y servicios en el mapa.
- El contenido administrativo se puede actualizar sin publicar una nueva versión de la app.
- La app funciona correctamente en pantallas móviles de 360 px de ancho o superiores.

## Fuera del MVP

- Chat P2P y logística completa de intercambios.
- Geolocalización indoor en tiempo real.
- Recomendador IA personalizado con memoria y moderación compleja.
- Cámara/escáner, gamificación y notificaciones segmentadas.

# Instrucciones:
-Analiza el boceto armado en figma
-Analiza el análisi realizado
-Sugiere el MVP

## Reglas de arquitectura

- La aplicación debe seguir una arquitectura offline-first: los contenidos de consulta se guardan localmente en el dispositivo y se sincronizan con el backend cuando existe conectividad.
- Firebase es el backend del MVP: Firebase Authentication para cuentas, Cloud Firestore para datos, Firebase Storage para imágenes y Firebase AI Logic para el asistente.
- Firestore es la fuente de verdad para datos compartidos. La caché local nunca debe sobrescribir stock, agenda ni anuncios.
- El stock solo puede ser actualizado por personal autorizado; siempre mostrar ubicación y fecha de última actualización.
- La IA se implementa con Gemini Developer API en su nivel gratuito mediante Firebase AI Logic. No colocar claves de Gemini ni credenciales administrativas dentro de la app.
- La IA debe consultar los datos oficiales para informar disponibilidad y debe indicar cuando una respuesta es una recomendación, no un dato confirmado.
- Se deben controlar cuotas, errores y respuestas sin conexión; ante falta de conexión se muestra el último contenido sincronizado.

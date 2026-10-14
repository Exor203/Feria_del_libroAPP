# Log de proceso

## 2026-09-16

- Se leyeron las reglas generales de Codex y las instrucciones del proyecto.
- Se inspeccionó el espacio de trabajo: solo existe `AGENTS.md`; no hay análisis previo como archivo ni repositorio Git.
- Se analizaron los bocetos aportados: home/catálogo, menú, eventos (agenda y anuncios), lista y detalle de libros, intercambio, detalle de anuncio y registro.
- Se definió un MVP centrado en información confiable y actualizable durante el evento.
- Se registraron propuestas técnicas, de diseño y de lógica en `docs/`.
- Se adoptó Firebase como backend offline-first y Firebase AI Logic con Gemini Developer API en nivel gratuito para el asistente.
- Se inició Etapa 1: documentación de instalación y preparación de la base local.
- Se instaló Node LTS con npm, se creó el proyecto Expo en `mobile/` y se implementó la primera interfaz offline con datos de demostración.
- Se verificó el tipado con `npx tsc --noEmit` sin errores.
- Se documentó la ejecución con `npm.cmd` para evitar el bloqueo de scripts de PowerShell.
- Se corrigió la navegación según los bocetos: Home con carrusel y calendario, botón-libro inferior para abrir el menú, Eventos con Agenda/Anuncios y vistas iniciales de catálogo, detalle, mapa, artistas, asistente e intercambio.

## Supuestos pendientes de validación

- La disponibilidad de libros depende de un inventario por stand.
- El mapa entregado es una referencia visual y no un sistema de posicionamiento en tiempo real.
- El intercambio requiere moderación y reglas de seguridad antes de habilitar interacción entre personas.

## 2026-10-07 — Libros, Home y acceso a pestañas

- Se retomó la maqueta Expo Go en la nueva computadora.
- Libros: portadas locales de los bocetos, búsqueda sin distinción de tildes, filtro por género y ficha con lanzamiento, géneros, sinopsis y disponibilidad de demostración.
- Home: carrusel de cuatro mensajes, selección de días, portadas que abren su ficha y fotografías de referencia que abren la sección Artistas.
- Menú: ventana modal inferior con fondo atenuado; Libros e Intercambio arriba, Eventos en el centro, Mapa y Artistas debajo; Cámara, libro para cerrar y Asistente al pie.
- Los recursos visuales se incluyen localmente. Se reutilizan las imágenes provistas con recorte en la vista, sin depender de descargas para mostrar la maqueta.
- Ventas, tendencias, historial de lectura y stock siguen siendo ejemplos. Las fotos del Home pertenecen al boceto y no representan el listado oficial de invitados.
- Cámara muestra una vista pendiente con acceso al buscador de Libros. Todavía no solicita permisos ni realiza reconocimiento.
## 2026-10-07 — Login de entrada

- Se incorporó la bienvenida del boceto como primera pantalla, con logo local y accesos para crear cuenta e iniciar sesión.
- Formularios con validación de nombre, correo, longitud de contraseña y confirmación; campos de contraseña ocultables y navegación atrás compatible con Android.
- La sesión de demostración vive únicamente en memoria y se puede cerrar desde Home. No se guardan contraseñas ni se crean cuentas reales.
- Google, Facebook y Apple muestran un aviso de disponibilidad futura. Firebase Authentication todavía no está configurado.
- El acceso a la maqueta requiere pasar por la bienvenida y un formulario identificado como modo de prueba. Esta sesión no habilita operaciones reales de intercambio.
- Acuerdo de Git: commit y push al terminar una etapa sin errores o por indicación del usuario; el mensaje del commit es el nombre de la etapa finalizada.
### Corrección de los logos del login

- Se reemplazó el recorte de la captura por componentes SVG locales: marca de la feria y símbolos de Google, Facebook y Apple.
- Se verificó visualmente una vista renderizada de los cuatro logos y se incluyó la atribución de los símbolos sociales.

## 2026-10-14 — Chat con IA

- Chat con consultas sugeridas, contexto conversacional, estados de carga, errores y reintento.
- Firebase AI Logic preparado; la prueba encontró un bloqueo de App Check.
- Por indicación del usuario, se agregó una prueba con Gemini Developer API a través de un servidor local para evitar reCAPTCHA y facturación.
- Se verificaron respuestas reales con contexto, aclaración de stock de demostración y manejo de error temporal del proveedor.
- La clave de Gemini queda únicamente en server/.env, excluida de Git; los errores enviados al teléfono no incluyen credenciales.
- Modelo final de la prueba: Gemini 3.5 Flash-Lite. Conversación de dos mensajes verificada usando el cliente de la app.

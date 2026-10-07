# Feria del Libro — lógica del sistema

## Roles

- Visitante: consulta contenido público.
- Usuario registrado: guarda preferencias y, en una fase posterior, publica intercambios.
- Operador de feria: actualiza inventario, agenda, anuncios, artistas y mapa.
- Moderador: revisa reportes y publicaciones de intercambio cuando exista ese módulo.

## Flujos

### Navegación principal

1. La pantalla Home muestra el carrusel de destacados y el mini calendario; el calendario no navega entre módulos.
2. El botón circular con icono de libro, centrado en la parte inferior, abre un menú de acceso a pestañas.
3. El menú contiene Libros, Intercambio, Eventos, Mapa, Artistas y Asistente IA.
4. Eventos contiene dos subpestañas internas: Agenda y Anuncios. Un anuncio abre su detalle dentro del mismo módulo.
5. Intercambio presenta por ahora el estado final de una operación. El flujo previo de oferta, contrapropuesta y aceptación queda pendiente de definición.

### Disponibilidad de libros

1. El usuario busca o filtra el catálogo.
2. La app consulta el libro y sus existencias por stand.
3. Muestra `disponible`, `poco stock` o `sin stock`, junto con ubicación y actualización.
4. Si no existe, propone títulos relacionados y registra la búsqueda anónima.

Firestore mantiene una caché offline en el dispositivo. Al reconectarse, actualiza contenidos de lectura; solo perfiles autorizados pueden escribir inventario.

### Eventos

1. El operador publica una actividad con fecha, hora, lugar y estado.
2. La agenda agrupa por día y ordena por hora.
3. Los anuncios destacados se muestran en orden de publicación y pueden enlazar al detalle del evento.

### Asistente

1. El usuario abre el asistente desde cualquier pantalla.
2. Para stock, el asistente consulta la misma fuente del catálogo antes de responder.
3. Para recomendaciones, utiliza preferencias expresas y catálogo disponible; informa que es una sugerencia.
4. Cuando no comprende una consulta, ofrece rutas concretas: buscar libro, agenda, mapa o ayuda.

Gemini se usa a través de Firebase AI Logic y con límites de cuota. Si el servicio no está disponible, el asistente ofrece las secciones de la app sin inventar respuestas.

### Intercambio (fase posterior)

1. Un usuario autenticado crea una publicación con libro ofrecido y buscado.
2. El sistema valida campos y la deja en revisión o publica según la política.
3. Un interesado envía una propuesta; las personas acuerdan un punto seguro dentro de la feria.
4. Se cierran propuestas caducadas, concretadas o reportadas.

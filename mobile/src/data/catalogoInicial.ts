import type { Artist, Book, EventItem, InventoryItem, MapPoint } from "../types/content";

export const books: Book[] = [
  { id: "el-eternauta", title: "El Eternauta", author: "Héctor Germán Oesterheld y Francisco Solano López", genres: ["Ciencia ficción", "Drama", "Aventura"], synopsis: "Una invasión extraterrestre sorprende a Buenos Aires y transforma la vida de Juan Salvo y sus amigos." },
  { id: "river-sing-me-home", title: "River Sing Me Home", author: "Eleanor Shearer", genres: ["Ficción histórica", "Drama"], synopsis: "Rachel abandona una plantación de Barbados para buscar a sus hijos." },
  { id: "batman", title: "Batman", author: "DC Comics", genres: ["Cómic", "Acción"], synopsis: "Historias del vigilante de Gotham y los desafíos que enfrenta para proteger la ciudad." },
];
export const catalogExamples: Book[] = [
  { id: "mafalda", title: "Mafalda: ¡La sopa!", author: "Quino", genres: ["Cómic"], synopsis: "" },
  { id: "quijote", title: "Don Quijote de la Mancha", author: "Miguel de Cervantes", genres: ["Clásicos"], synopsis: "" },
  { id: "habitos", title: "Hábitos atómicos", author: "James Clear", genres: ["Bienestar"], synopsis: "" },
  { id: "harry", title: "Harry Potter y la Orden del Fénix", author: "J. K. Rowling", genres: ["Fantasía"], synopsis: "" },
  { id: "spiderman", title: "The Amazing Spider-Man", author: "Marvel Comics", genres: ["Cómic"], synopsis: "" },
  { id: "watchmen", title: "Watchmen", author: "Alan Moore y Dave Gibbons", genres: ["Cómic"], synopsis: "" },
  { id: "yuggoth", title: "Relatos de Yuggoth", author: "Alan Moore", genres: ["Cómic"], synopsis: "" },
  { id: "ingenio", title: "Juegos de ingenio", author: "John Katzenbach", genres: ["Suspenso"], synopsis: "" },
  { id: "paciente", title: "La paciente silenciosa", author: "Alex Michaelides", genres: ["Suspenso"], synopsis: "" },
  { id: "soledad", title: "La soledad", author: "Gabriel Rolón", genres: ["Ensayo"], synopsis: "" },
  { id: "pinocho", title: "Pinocho", author: "Carlo Collodi", genres: ["Infantil"], synopsis: "" },
  { id: "dune", title: "Dune", author: "Frank Herbert", genres: ["Ciencia ficción"], synopsis: "" },
];

export const inventory: InventoryItem[] = [
  { bookId: "el-eternauta", standId: "Stand A", status: "available", quantity: 12, updatedAt: "16/09 10:00" },
  { bookId: "river-sing-me-home", standId: "Stand B", status: "low_stock", quantity: 2, updatedAt: "16/09 10:00" },
  { bookId: "batman", standId: "Stand A", status: "out_of_stock", quantity: 0, updatedAt: "16/09 10:00" },
];
export const events: EventItem[] = [
  { id: "inauguracion", title: "Inauguración del evento", startsAt: "01 Oct · 12:00", endsAt: "13:00", venue: "Auditorio B", description: "Apertura oficial de la Feria del Libro." },
  { id: "sacheri", title: "Encuentro con Eduardo Sacheri", startsAt: "01 Oct · 16:00", endsAt: "17:00", venue: "Auditorio B", description: "Charla y firma de ejemplares." },
];
export const artists: Artist[] = [{ id: "eduardo-sacheri", name: "Eduardo Sacheri", biography: "Escritor argentino reconocido por historias sobre memoria, amistad y vida cotidiana." }];
export const mapPoints: MapPoint[] = [
  { id: "entrada", name: "Entrada principal", category: "entrance" }, { id: "stand-a", name: "Stand A", category: "stand" }, { id: "stand-b", name: "Stand B", category: "stand" }, { id: "auditorio-b", name: "Auditorio B", category: "auditorium" },
];

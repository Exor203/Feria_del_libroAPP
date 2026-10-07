import type { Artist, Book, EventItem, InventoryItem, MapPoint } from "../types/content";

export const books: Book[] = [
  { id: "el-eternauta", title: "El Eternauta", author: "Héctor Germán Oesterheld y Francisco Solano López", genres: ["Ciencia ficción", "Drama", "Aventura"], synopsis: "Una invasión extraterrestre sorprende a Buenos Aires y transforma la vida de Juan Salvo y sus amigos." },
  { id: "river-sing-me-home", title: "River Sing Me Home", author: "Eleanor Shearer", genres: ["Ficción histórica", "Drama"], synopsis: "Rachel abandona una plantación de Barbados para buscar a sus hijos." },
  { id: "batman", title: "Batman", author: "DC Comics", genres: ["Cómic", "Acción"], synopsis: "Historias del vigilante de Gotham y los desafíos que enfrenta para proteger la ciudad." },
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

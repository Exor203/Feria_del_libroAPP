import { artists, books, events, inventory, mapPoints } from "../data/catalogoInicial";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const localContentRepository = {
  getArtists: () => artists,
  getBookAvailability: (bookId: string) => inventory.find((item) => item.bookId === bookId),
  getEvents: () => events,
  getMapPoints: () => mapPoints,
  searchBooks: (query: string) => {
    const term = normalize(query.trim());
    return books.filter((book) => !term || [book.title, book.author, ...book.genres].some((value) => normalize(value).includes(term)));
  },
};

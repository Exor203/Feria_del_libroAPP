import { useEffect, useMemo, useState } from "react";
import { BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { books, catalogExamples } from "../data/catalogoInicial";
import { bookCovers } from "../data/bookCovers";
import { Enter, Heading, Pill } from "../components/FairUi";
import type { ShelfBook } from "../services/library";
const catalog = [...books, ...catalogExamples];
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
import { localContentRepository } from "../services/localContentRepository";
import type { Book } from "../types/content";

type Props = { selectedBookId: string | null; onSelect: (id: string) => void; onCloseDetail: () => void; onExchange: () => void; onSave?: (book: ShelfBook) => void };
const reference = require("../../assets/books/catalog-reference.png");
const detailReference = require("../../assets/books/detail-reference.png");
const covers: Record<string, { x: number; y: number }> = {
  "river-sing-me-home": { x: 263, y: 243 },
  "el-eternauta": { x: 263, y: 472 },
  batman: { x: 263, y: 707 },
};
const genres = Array.from(new Set(catalog.flatMap(book => book.genres)));

export function Cover({ book, width, detail = false }: { book: Book; width: number; detail?: boolean }) {
  const supplied = bookCovers[book.id];
  if (supplied) return <Image source={supplied} accessibilityLabel={`Portada de ${book.title}`} resizeMode={detail ? "contain" : "cover"} style={{ width, height: detail ? Math.min(width, 300) : width * 1.48, borderRadius: 11 }} />;
  const large = detail && book.id === "el-eternauta";
  const crop = large ? { x: 395, y: 164, width: 392, height: 307 } : { ...covers[book.id], width: 120, height: 180 };
  const scale = width / crop.width;
  return <View accessible accessibilityLabel={`Portada de ${book.title}`} style={{ width, height: crop.height * scale, overflow: "hidden", borderRadius: detail ? 22 : 11, backgroundColor: "#0C4358" }}>
    <Image source={large ? detailReference : reference} accessible={false} resizeMode="stretch" style={{ position: "absolute", width: (large ? 850 : 708) * scale, height: (large ? 1058 : 1148) * scale, left: -crop.x * scale, top: -crop.y * scale }} />
  </View>;
}

export default function BooksScreen({ selectedBookId, onSelect, onCloseDetail, onExchange, onSave }: Props) {
  const [savedId, setSavedId] = useState<string>();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<{ title: string; items: Book[] }>();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 560);
  const coverWidth = Math.max(78, (contentWidth - 30) / 4);
  const found = useMemo(() => (selectedShelf?.items ?? catalog).filter(book => (!availabilityOnly || localContentRepository.getBookAvailability(book.id)?.status === "available") && (!genre || book.genres.includes(genre)) && normalize([book.title, book.author, ...book.genres].join(" ")).includes(normalize(query.trim()))), [query, genre, availabilityOnly, selectedShelf]);
  const selected = catalog.find(book => book.id === selectedBookId);
  const openBook = (id: string) => { setAvailabilityOpen(false); onSelect(id); };
  useEffect(() => {
    if (!selectedBookId) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { onCloseDetail(); return true; });
    return () => subscription.remove();
  }, [selectedBookId, onCloseDetail]);

  const row = (title: string, items: Book[]) => <View key={title} style={s.section}>
    <View style={s.sectionHeader}><Text style={s.sectionTitle}>{title}</Text><Pressable accessibilityRole="button" onPress={() => setSelectedShelf({ title, items })}><Text style={s.more}>Ver todos →</Text></Pressable></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>{items.map(book => <Pressable key={book.id} accessibilityRole="button" accessibilityLabel={`Ver ${book.title}, de ${book.author}`} onPress={() => openBook(book.id)} style={({ pressed }) => ({ width: coverWidth, opacity: pressed ? 0.7 : 1 })}>
      <Cover book={book} width={coverWidth} />
      <Text style={s.resultTitle} numberOfLines={2}>{book.title}</Text>
      <Text style={s.hint} numberOfLines={2}>{book.author}</Text>
    </Pressable>)}</ScrollView>
  </View>;

  if (selected) {
    const availability = localContentRepository.getBookAvailability(selected.id);
    const synopsis = selected.id === "el-eternauta" ? "El Eternauta es una historieta creada por Héctor Germán Oesterheld y Francisco Solano López.\n\nUna extraña y letal nevada cae sobre Buenos Aires y marca el inicio de una invasión extraterrestre. Juan Salvo y sus amigos se organizan para sobrevivir y resistir. La historia pone en el centro al héroe colectivo: la solidaridad y la lucha comunitaria frente a la amenaza." : selected.synopsis;
    return <Enter change={selected.id}><ScrollView key={selected.id} contentContainerStyle={s.content}>
      <View style={{ alignSelf: "center" }}><Cover book={selected} width={Math.min(contentWidth * .86, 340)} detail /></View>
      <View>
        <Text style={s.title}>{selected.title}</Text>
        <Text style={s.body}>{selected.id === "el-eternauta" ? "Héctor G. Oesterheld\nFrancisco Solano López" : selected.author}</Text>
        <Text style={s.body}>{selected.genres.join(", ")}</Text>
      </View>
      {selected.id === "el-eternauta" && <View style={s.sectionHeader}><Text style={s.rating}>★★★★◐</Text><Text style={s.body} accessibilityLabel="Puntuación de ejemplo: 4,8"> (4.8)</Text></View>}
      <View><Text style={s.label}>Sinopsis</Text><Text style={s.body}>{synopsis || "Ficha de catálogo de prueba."}</Text></View>
      <View style={s.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Buscar disponibilidad y stand" accessibilityState={{ expanded: availabilityOpen }} onPress={() => setAvailabilityOpen(value => !value)} style={s.action}><Text style={s.actionLabel}>⌕  Buscar</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Intercambiar ${selected.title}`} onPress={onExchange} style={s.action}><Text style={s.actionLabel}>↔  Tradeo</Text></Pressable>
      </View>
      {availabilityOpen && <View style={s.availability}>
        <Text style={s.label}>DISPONIBILIDAD · EJEMPLO</Text>
        <Text style={s.body}>{availability ? `${availability.status === "available" ? "Disponible" : availability.status === "low_stock" ? "Poco stock" : "Sin stock"} · ${availability.standId}` : "Sin información de disponibilidad"}</Text>
        {availability && <Text style={s.hint}>Última actualización: {availability.updatedAt}</Text>}
        <Text style={s.hint}>Datos de demostración; consultar en el stand.</Text>
      </View>}
      {onSave && <Pill label="Guardar en mi lista" active onPress={() => { onSave(selected); setSavedId(selected.id); }} />}
      {savedId === selected.id && <Text accessibilityLiveRegion="polite" style={s.body}>Guardado en tu perfil.</Text>}
    </ScrollView></Enter>;
  }

  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    <Heading title="Libros" subtitle="Tu librería portátil" />
    <View style={s.search}>
      <Text style={s.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Buscar libros, autores o géneros…" placeholderTextColor="#0C4358" accessibilityLabel="Buscar por título, autor o género" returnKeyType="search" style={s.input} />
      {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery("")} style={s.clear}><Text style={s.backText}>×</Text></Pressable>}
    </View>
    <View style={s.actions}>
      <Pill label={genre ? `Filtro · ${genre}` : "☷  Filtro"} active onPress={() => setFilterOpen(value => !value)} />
      <Pill label={availabilityOnly ? "Disponibles ✓" : "Disponibilidad ⌄"} active={availabilityOnly} onPress={() => setAvailabilityOnly(value => !value)} />
    </View>
    {filterOpen && <View style={s.filters}>{[null, ...genres].map(item => <Pressable key={item ?? "all"} accessibilityRole="button" accessibilityState={{ selected: genre === item }} onPress={() => setGenre(item)} style={[s.chip, genre === item && s.chipActive]}><Text style={[s.chipText, genre === item && s.chipTextActive]}>{item ?? "Todos"}</Text></Pressable>)}</View>}
    {query.trim() || genre || availabilityOnly || selectedShelf ? <View>
      {selectedShelf && <Pill label="‹ Volver a las secciones" onPress={() => setSelectedShelf(undefined)} />}
      <Text style={s.sectionTitle}>{selectedShelf?.title ?? "Resultados"} · {found.length}</Text>
      {found.length ? <View style={s.results}>{found.map(book => <Pressable key={book.id} accessibilityRole="button" accessibilityLabel={`Ver ${book.title}`} onPress={() => openBook(book.id)} style={{ width: coverWidth }}><Cover book={book} width={coverWidth} /><Text style={s.resultTitle}>{book.title}</Text></Pressable>)}</View> : <View style={s.empty}><Text style={s.body}>No encontramos libros con esta búsqueda.</Text><Pressable accessibilityRole="button" onPress={() => { setQuery(""); setGenre(null); setAvailabilityOnly(false); setSelectedShelf(undefined); }} style={s.back}><Text style={s.backText}>Ver todos los libros</Text></Pressable></View>}
    </View> : <>
      {row("Últimos lanzamientos", [...catalogExamples.slice(0, 4), books[1]])}
      {row("Porque ya leíste:", [books[2], ...catalogExamples.slice(4, 7), books[0]])}
      {row("Descubrir", [...catalogExamples.slice(7), ...books])}
    </>}
  </ScrollView>;
}

const s = StyleSheet.create({
  content: { width: "100%", maxWidth: 600, alignSelf: "center", paddingHorizontal: 22, paddingTop: 8, paddingBottom: 120, gap: 15 },
  search: { flexDirection: "row", borderColor: "#0C4358", borderWidth: 1, borderRadius: 24, alignItems: "center", backgroundColor: "#F8F6ED" },
  input: { flex: 1, color: "#0C4358", fontSize: 15, paddingHorizontal: 8, minHeight: 40 },
  searchIcon: { color: "#064057", fontSize: 23, marginLeft: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  more: { marginLeft: 5, color: "#064057", fontSize: 12, fontWeight: "700" },
  rating: { color: "#E8A027", fontSize: 27 },
  clear: { padding: 12 }, filterButton: { flexDirection: "row", alignItems: "center", gap: 9, minHeight: 46, alignSelf: "flex-start" },
  filterIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#0C4358", alignItems: "center", justifyContent: "center" },
  funnelTop: { width: 0, height: 0, borderLeftWidth: 13, borderRightWidth: 13, borderTopWidth: 16, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "white" },
  funnelStem: { width: 6, height: 10, backgroundColor: "white", marginTop: -2, borderBottomRightRadius: 3 },
  filterText: { color: "#0C4358", fontWeight: "700", flexShrink: 1 }, section: { gap: 8 }, sectionTitle: { color: "#0C4358", fontSize: 19, fontWeight: "700", flex: 1 },
  row: { flexDirection: "row", gap: 12 }, filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: "#0C4358", borderRadius: 22 }, chipActive: { backgroundColor: "#0C4358" }, chipText: { color: "#0C4358" }, chipTextActive: { color: "white" },
  results: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 }, resultTitle: { color: "#0C4358", fontWeight: "600", marginTop: 6 }, empty: { paddingVertical: 20 },
  back: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }, backText: { color: "#0C4358", fontWeight: "700", fontSize: 16 },
  title: { color: "#064057", fontSize: 33, fontWeight: "800" }, actions: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  action: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 36, borderRadius: 20, borderWidth: 1, borderColor: "#064057", backgroundColor: "#F8F6ED" }, actionLabel: { color: "#064057", fontSize: 15, fontWeight: "600" },
  label: { color: "#0C4358", fontSize: 17, fontWeight: "700", marginBottom: 3 }, body: { color: "#064057", fontSize: 15, lineHeight: 20 }, hint: { color: "#596565", fontSize: 12, lineHeight: 17 }, availability: { padding: 14, gap: 6, backgroundColor: "#FFFFFF", borderRadius: 12 },
});

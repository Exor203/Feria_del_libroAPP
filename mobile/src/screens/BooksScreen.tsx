import { useEffect, useMemo, useState } from "react";
import { BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { books } from "../data/catalogoInicial";
import { localContentRepository } from "../services/localContentRepository";
import type { Book } from "../types/content";

type Props = { selectedBookId: string | null; onSelect: (id: string) => void; onCloseDetail: () => void; onExchange: () => void };
const reference = require("../../assets/books/catalog-reference.png");
const detailReference = require("../../assets/books/detail-reference.png");
const covers: Record<string, { x: number; y: number }> = {
  "river-sing-me-home": { x: 263, y: 243 },
  "el-eternauta": { x: 263, y: 472 },
  batman: { x: 263, y: 707 },
};
const releases: Record<string, string> = { "el-eternauta": "1957 – 1959", "river-sing-me-home": "2023", batman: "Consultar edición" };
const genres = Array.from(new Set(books.flatMap(book => book.genres)));

export function Cover({ book, width, detail = false }: { book: Book; width: number; detail?: boolean }) {
  const large = detail && book.id === "el-eternauta";
  const crop = large ? { x: 395, y: 164, width: 392, height: 307 } : { ...covers[book.id], width: 120, height: 180 };
  const scale = width / crop.width;
  return <View accessible accessibilityLabel={`Portada de ${book.title}`} style={{ width, height: crop.height * scale, overflow: "hidden", borderRadius: detail ? 22 : 11, backgroundColor: "#0C4358" }}>
    <Image source={large ? detailReference : reference} accessible={false} resizeMode="stretch" style={{ position: "absolute", width: (large ? 850 : 708) * scale, height: (large ? 1058 : 1148) * scale, left: -crop.x * scale, top: -crop.y * scale }} />
  </View>;
}

export default function BooksScreen({ selectedBookId, onSelect, onCloseDetail, onExchange }: Props) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 560);
  const coverWidth = (contentWidth - 24) / 3;
  const found = useMemo(() => localContentRepository.searchBooks(query).filter(book => !genre || book.genres.includes(genre)), [query, genre]);
  const selected = books.find(book => book.id === selectedBookId);
  const openBook = (id: string) => { setAvailabilityOpen(false); onSelect(id); };
  useEffect(() => {
    if (!selectedBookId) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { onCloseDetail(); return true; });
    return () => subscription.remove();
  }, [selectedBookId, onCloseDetail]);

  const row = (title: string, items: Book[], subtitle?: string) => <View key={title} style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    {subtitle && <Text style={s.hint}>{subtitle}</Text>}
    <View style={s.row}>{items.map(book => <Pressable key={book.id} accessibilityRole="button" accessibilityLabel={`Ver ${book.title}, de ${book.author}`} onPress={() => openBook(book.id)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Cover book={book} width={coverWidth} />
    </Pressable>)}</View>
  </View>;

  if (selected) {
    const availability = localContentRepository.getBookAvailability(selected.id);
    const synopsis = selected.id === "el-eternauta" ? "El Eternauta es una historieta creada por Héctor Germán Oesterheld y Francisco Solano López.\n\nUna extraña y letal nevada cae sobre Buenos Aires y marca el inicio de una invasión extraterrestre. Juan Salvo y sus amigos se organizan para sobrevivir y resistir. La historia pone en el centro al héroe colectivo: la solidaridad y la lucha comunitaria frente a la amenaza." : selected.synopsis;
    return <ScrollView key={selected.id} contentContainerStyle={s.content}>
      <Pressable accessibilityRole="button" onPress={onCloseDetail} style={s.back}><Text style={s.backText}>‹ Volver al catálogo</Text></Pressable>
      <Text style={s.title}>{selected.title}</Text>
      <View>
        <Cover book={selected} width={contentWidth} detail />
        <View style={s.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Intercambiar ${selected.title}`} onPress={onExchange} style={s.action}><Text style={s.actionIcon}>↔</Text><Text style={s.actionLabel}>Intercambiar</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Consultar disponibilidad y stand" accessibilityState={{ expanded: availabilityOpen }} onPress={() => setAvailabilityOpen(value => !value)} style={s.action}><Text style={s.actionIcon}>⌕</Text><Text style={s.actionLabel}>Disponibilidad</Text></Pressable>
        </View>
      </View>
      {availabilityOpen && <View style={s.availability}>
        <Text style={s.label}>DISPONIBILIDAD · EJEMPLO</Text>
        <Text style={s.body}>{availability ? `${availability.status === "available" ? "Disponible" : availability.status === "low_stock" ? "Poco stock" : "Sin stock"} · ${availability.standId}` : "Sin información de disponibilidad"}</Text>
        {availability && <Text style={s.hint}>Última actualización: {availability.updatedAt}</Text>}
        <Text style={s.hint}>Datos de demostración; consultar en el stand.</Text>
      </View>}
      <View><Text style={s.label}>LANZAMIENTO</Text><Text style={s.body}>{releases[selected.id]}</Text></View>
      <View><Text style={s.label}>GÉNEROS</Text><Text style={s.body}>{selected.genres.join(", ") + "."}</Text></View>
      <View><Text style={s.label}>SINOPSIS</Text><Text style={s.body}>{synopsis}</Text></View>
      <Text style={s.hint}>{selected.author}</Text>
    </ScrollView>;
  }

  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    <View style={s.search}>
      <TextInput value={query} onChangeText={setQuery} placeholder="Buscar..." placeholderTextColor="#0C4358" accessibilityLabel="Buscar por título, autor o género" returnKeyType="search" style={s.input} />
      {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery("")} style={s.clear}><Text style={s.backText}>×</Text></Pressable>}
    </View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: filterOpen }} onPress={() => setFilterOpen(value => !value)} style={s.filterButton}>
      <View style={s.filterIcon}><View style={s.funnelTop} /><View style={s.funnelStem} /></View><Text style={s.filterText}>FILTRO{genre ? ` · ${genre}` : ""}</Text>
    </Pressable>
    {filterOpen && <View style={s.filters}>{[null, ...genres].map(item => <Pressable key={item ?? "all"} accessibilityRole="button" accessibilityState={{ selected: genre === item }} onPress={() => setGenre(item)} style={[s.chip, genre === item && s.chipActive]}><Text style={[s.chipText, genre === item && s.chipTextActive]}>{item ?? "Todos"}</Text></Pressable>)}</View>}
    {query.trim() || genre ? <View>
      <Text style={s.sectionTitle}>Resultados · {found.length}</Text>
      {found.length ? <View style={s.results}>{found.map(book => <Pressable key={book.id} accessibilityRole="button" accessibilityLabel={`Ver ${book.title}`} onPress={() => openBook(book.id)} style={{ width: coverWidth }}><Cover book={book} width={coverWidth} /><Text style={s.resultTitle}>{book.title}</Text></Pressable>)}</View> : <View style={s.empty}><Text style={s.body}>No encontramos libros con esta búsqueda.</Text><Pressable accessibilityRole="button" onPress={() => { setQuery(""); setGenre(null); }} style={s.back}><Text style={s.backText}>Ver todos los libros</Text></Pressable></View>}
    </View> : <>
      {row("ÚLTIMOS LANZAMIENTOS", [books[1]])}
      {row("Porque ya leíste: El Eternauta", [books[2], books[1]], "Recomendaciones de ejemplo")}
      {row("Descubrir", [books[2], books[0], books[1]])}
    </>}
  </ScrollView>;
}

const s = StyleSheet.create({
  content: { width: "100%", maxWidth: 600, alignSelf: "center", padding: 20, paddingBottom: 120, gap: 18 },
  search: { flexDirection: "row", borderColor: "#0C4358", borderWidth: 3, borderRadius: 15, alignItems: "center" },
  input: { flex: 1, color: "#0C4358", fontSize: 20, paddingHorizontal: 13, paddingVertical: 9, minHeight: 46 },
  clear: { padding: 12 }, filterButton: { flexDirection: "row", alignItems: "center", gap: 9, minHeight: 46, alignSelf: "flex-start" },
  filterIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#0C4358", alignItems: "center", justifyContent: "center" },
  funnelTop: { width: 0, height: 0, borderLeftWidth: 13, borderRightWidth: 13, borderTopWidth: 16, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "white" },
  funnelStem: { width: 6, height: 10, backgroundColor: "white", marginTop: -2, borderBottomRightRadius: 3 },
  filterText: { color: "#0C4358", fontWeight: "700", flexShrink: 1 }, section: { gap: 8 }, sectionTitle: { color: "#0C4358", fontSize: 17, fontWeight: "700" },
  row: { flexDirection: "row", gap: 12 }, filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: "#0C4358", borderRadius: 22 }, chipActive: { backgroundColor: "#0C4358" }, chipText: { color: "#0C4358" }, chipTextActive: { color: "white" },
  results: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 }, resultTitle: { color: "#0C4358", fontWeight: "600", marginTop: 6 }, empty: { paddingVertical: 20 },
  back: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }, backText: { color: "#0C4358", fontWeight: "700", fontSize: 16 },
  title: { color: "#20201D", fontSize: 30, fontWeight: "800" }, actions: { flexDirection: "row", backgroundColor: "#0C4358", borderRadius: 13, marginTop: -8 },
  action: { flex: 1, alignItems: "center", paddingVertical: 8 }, actionIcon: { color: "white", fontSize: 32, lineHeight: 36, fontWeight: "800" }, actionLabel: { color: "white", fontSize: 12, fontWeight: "600" },
  label: { color: "#0C4358", fontSize: 17, fontWeight: "700", marginBottom: 3 }, body: { color: "#20201D", fontSize: 15, lineHeight: 21 }, hint: { color: "#596565", fontSize: 12, lineHeight: 17 }, availability: { padding: 14, gap: 6, backgroundColor: "#FFFFFF", borderRadius: 12 },
});

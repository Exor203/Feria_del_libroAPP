import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Enter, FairScroll, Heading, Pill, ui } from "../components/FairUi";
import { bookCovers } from "../data/bookCovers";
import type { ShelfBook, Trade } from "../services/library";

const dune = { id: "dune", title: "Dune", author: "Frank Herbert" };
const amazing = { id: "amazing", title: "Amazing Fantasy", author: "Marvel Comics" };
const superman = { id: "superman", title: "Action Comics", author: "DC Comics" };
const yuggoth = { id: "yuggoth", title: "Relatos de Yuggoth", author: "Alan Moore" };
const pinocho = { id: "pinocho", title: "Pinocho", author: "Carlo Collodi" };
const offers = [dune, amazing, superman, { id: "viaje", title: "Viaje al oeste", author: "Siruela" }, { id: "rabia", title: "Rabia", author: "Stephen King" }];
const handles: Record<string, string> = { dune: "JV_Ru1d1tos", amazing: "Scomes23", superman: "Dadomago", viaje: "J.Pera alta87", rabia: "Ahmito_34Gamer" };
const titleColors = ["#DB420C", "#9D1E0E", "#3583EE", "#E72852", "#281A22"];
const exampleTrades: Trade[] = [
  { id: "demo-pending", offered: pinocho, received: dune, status: "Pendiente" },
  { id: "demo-accepted", offered: { id: "harry", title: "Harry Potter y la Orden del Fénix", author: "J. K. Rowling" }, received: { id: "paciente", title: "La paciente silenciosa", author: "Alex Michaelides" }, status: "Aceptado" },
  { id: "demo-complete", offered: superman, received: { id: "hulk", title: "Wolverine vs. Hulk", author: "Marvel Comics" }, status: "Finalizado" },
];
const coral = "#ED5B47";

export function TradingScreen({ books, trades, ready, onSend, onExit }: {
  books: ShelfBook[]; trades: Trade[]; ready: boolean; onSend: (trade: Trade) => void; onExit: () => void;
}) {
  const [page, setPage] = useState<"explore" | "mine" | "choose" | "review" | "sent" | "detail">("explore");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<ShelfBook>();
  const [offered, setOffered] = useState<ShelfBook>();
  const [detail, setDetail] = useState<Trade>();
  const submitting = useRef(false);
  const goBack = useCallback(() => {
    if (page === "review") setPage("choose");
    else if (page === "detail" || page === "sent") setPage("mine");
    else if (page !== "explore") setPage("explore");
    else onExit();
  }, [page, onExit]);
  useEffect(() => {
    const back = BackHandler.addEventListener("hardwareBackPress", () => { goBack(); return true; });
    return () => back.remove();
  }, [goBack]);
  const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const matches = (book: ShelfBook) => normalize(book.title + " " + book.author).includes(normalize(query.trim()));
  const choices = [...new Map([...books, amazing, yuggoth, superman, dune].map(book => [book.id, book])).values()].filter(book => book.id !== target?.id);

  return <Enter change={page}><FairScroll>
    <Pressable accessibilityRole="button" onPress={goBack} style={s.back}><Text style={s.backText}>‹ Volver</Text></Pressable>
    {(page === "explore" || page === "mine") && <>
      {page === "explore" ? <Heading title="Trading" subtitle="Tu llave para nuevos universos" /> : <Text accessibilityRole="header" style={s.title}>Trading</Text>}
      <View style={s.search}><Text style={s.searchIcon}>⌕</Text><TextInput accessibilityLabel="Buscar libros, autores o géneros" style={s.searchInput} placeholder="Buscar libros, autores o géneros…" value={query} onChangeText={setQuery} /></View>
      <View style={ui.row}>
        <Pill label="Explorar" active={page === "explore"} onPress={() => setPage("explore")} />
        <Pill label="Mis intercambios ⌄" active={page === "mine"} onPress={() => setPage("mine")} />
      </View>
      {page === "explore" ? offers.filter(matches).map(book => {
        const color = titleColors[offers.indexOf(book)];
        const open = () => { submitting.current = false; setTarget(book); setOffered(undefined); setPage("choose"); };
        const marked = bookmarks.includes(book.id);
        return <View key={book.id} style={s.listCard}>
          <TradeCover book={book} />
          <View style={s.listCopy}>
            <Text style={[s.bookTitle, { color }]}>{book.title}</Text>
            <Text style={{ color }}>{book.author}</Text>
            <Pressable accessibilityRole="button" onPress={open} style={s.explore}><Text style={s.exploreText}>Explorar</Text></Pressable>
            <Text style={s.handle}>◉ {handles[book.id]}</Text>
          </View>
          <View style={s.listActions}>
            <Pressable accessibilityRole="button" accessibilityLabel={marked ? "Quitar marcador" : "Marcar oferta"} onPress={() => setBookmarks(previous => marked ? previous.filter(id => id !== book.id) : [...previous, book.id])} style={s.circle}><Text style={s.circleText}>{marked ? "♥" : "⚑"}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Proponer intercambio por ${book.title}`} onPress={open} style={s.circle}><Text style={s.circleText}>↻</Text></Pressable>
          </View>
        </View>;
      }) : [...trades, ...exampleTrades].filter(item => matches(item.offered) || matches(item.received)).map(item => {
        const color = item.status === "Pendiente" ? coral : item.status === "Aceptado" ? "#299788" : "#888";
        return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.status + " · Ver intercambio"} onPress={() => { setDetail(item); setPage("detail"); }} style={[s.mineCard, { borderColor: color }]}>
          <View style={s.mineRow}><TradeCover book={item.offered} /><Text style={[s.arrow, { color }]}>↻</Text><TradeCover book={item.received} /><Text style={[s.arrow, { color }]}>›</Text></View>
          <Text style={[s.statusChip, { backgroundColor: color }]}>{item.status}</Text>
          <Text style={[s.handle, { color }]}>◉ {handles[item.received.id] ?? "Intercambio de prueba"}</Text>
        </Pressable>;
      })}
    </>}
    {(page === "choose" || page === "review") && target && <>
      <Text accessibilityRole="header" style={s.title}>Propuesta</Text>
      {page === "choose" ? <>
        <Text style={ui.heading}>Querés obtener:</Text><BookCard book={target} large />
        <Text style={ui.heading}>¿Qué libro ofrecés?</Text><Text style={ui.body}>Seleccioná uno:</Text>
        {choices.map(book => <Pressable key={book.id} accessibilityRole="radio" accessibilityState={{ checked: book.id === offered?.id }} onPress={() => setOffered(book)}>
          <BookCard book={book} selected={book.id === offered?.id} selectable />
        </Pressable>)}
        <Pill label="Continuar →" active disabled={!offered} onPress={() => setPage("review")} />
      </> : offered && <>
        <Text style={ui.heading}>Querés obtener:</Text><BookCard book={offered} large badge="Vos ofrecés" />
        <Text style={s.exchangeArrow}>↻</Text><BookCard book={target} large badge="Vos recibís" />
        <View style={s.meet}><Text style={ui.body}>♦  Encuentro en la feria (por definir)</Text></View>
        <Pill label="Enviar propuesta   ➤" active disabled={!ready} onPress={() => {
          if (submitting.current) return;
          submitting.current = true;
          const trade: Trade = { id: `trade-${Date.now()}`, offered, received: target, status: "Pendiente" };
          onSend(trade); setDetail(trade); setPage("sent");
        }} />
      </>}
    </>}
    {(page === "sent" || page === "detail") && detail && <>
      <Text style={s.paperPlane}>➤</Text>
      <Text accessibilityRole="header" style={[s.title, { textAlign: "center" }]}>{page === "sent" ? "Propuesta enviada" : "Mi intercambio"}</Text>
      <Text style={[ui.body, { textAlign: "center" }]}>Propuesta de prueba para {handles[detail.received.id] ?? detail.received.title}.</Text>
      <View style={s.timeline}>{[["Propuesta enviada", "Esperando respuesta"], ["Aceptada", "El usuario aceptó la propuesta"], ["Punto de encuentro", "Se define el lugar en la feria"], ["Finalizado", "¡Intercambio finalizado!"]].map(([step, description], index) => {
        const filled = index <= (detail.status === "Finalizado" ? 3 : detail.status === "Aceptado" ? 1 : 0);
        return <View key={step} style={s.step}><View style={[s.dot, filled && { backgroundColor: coral }]} /><View style={{ flex: 1 }}><Text style={s.stepTitle}>{step}</Text><Text style={s.stepDescription}>{description}</Text></View></View>;
      })}</View>
      <View style={s.meet}><Text style={[ui.body, { color: coral }]}>♦  Punto de encuentro: {detail.status === "Pendiente" ? "por definir" : "Aula B"}</Text></View>
      <Pill label="Ver mis intercambios" onPress={() => setPage("mine")} />
    </>}
  </FairScroll></Enter>;
}

function TradeCover({ book, large = false }: { book: ShelfBook; large?: boolean }) {
  const cover = bookCovers[book.id];
  return cover ? <Image source={cover} accessibilityLabel={book.title} style={{ width: large ? 96 : 64, height: large ? 140 : 94, borderRadius: 9 }} /> :
    <View style={{ width: large ? 96 : 64, height: large ? 140 : 94, borderRadius: 9, backgroundColor: "#D8E4E8", justifyContent: "center", padding: 5 }}><Text numberOfLines={3} style={{ textAlign: "center" }}>{book.title}</Text></View>;
}
function BookCard({ book, large = false, selected = false, selectable = false, badge }: { book: ShelfBook; large?: boolean; selected?: boolean; selectable?: boolean; badge?: string }) {
  const color = badge === "Vos recibís" ? coral : selected ? "#299788" : "#064057";
  return <View style={[s.listCard, { borderColor: color, marginHorizontal: 12 }]}>
    <TradeCover book={book} large={large} />
    <View style={s.listCopy}>
      {badge && <Text style={[s.tradeBadge, { backgroundColor: color === coral ? "#F6C2B8" : "#A1D9E6", color }]}>{badge}</Text>}
      <Text style={[s.bookTitle, { color }]}>{book.title}</Text><Text style={{ color }}>{book.author}</Text>
      {large && handles[book.id] && <Text style={s.handle}>◉ {handles[book.id]}</Text>}
    </View>
    {selectable && <Text style={[s.arrow, { color }]}>{selected ? "◉" : "○"}</Text>}
  </View>;
}

const s = StyleSheet.create({
  back: { alignSelf: "flex-start", minHeight: 34, justifyContent: "center" },
  backText: { color: "#064057", fontSize: 23, fontWeight: "700" },
  title: { color: "#064057", fontSize: 32, fontWeight: "900" },
  search: { ...ui.input, flexDirection: "row", alignItems: "center", gap: 7 },
  searchIcon: { color: "#064057", fontSize: 22 },
  searchInput: { color: "#064057", flex: 1, fontSize: 15 },
  listCard: { ...ui.card, borderWidth: 2, padding: 8, flexDirection: "row", alignItems: "center", minHeight: 106 },
  listCopy: { flex: 1, gap: 3 },
  bookTitle: { color: "#064057", fontSize: 19, fontWeight: "800" },
  explore: { backgroundColor: "#064057", borderRadius: 18, paddingVertical: 4, paddingHorizontal: 14, alignSelf: "flex-start" },
  exploreText: { color: "white", fontSize: 11 },
  handle: { color: "#676767", fontSize: 12 },
  listActions: { justifyContent: "space-between", alignSelf: "stretch" },
  circle: { backgroundColor: "#F9DED8", width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  circleText: { color: coral, fontSize: 24 },
  mineCard: { ...ui.card, marginHorizontal: 15, borderWidth: 2, gap: 8 },
  mineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5 },
  arrow: { fontSize: 30 },
  statusChip: { alignSelf: "flex-start", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 4, color: "white" },
  tradeBadge: { alignSelf: "flex-start", borderRadius: 18, paddingHorizontal: 11, paddingVertical: 5, fontWeight: "700" },
  exchangeArrow: { alignSelf: "center", color: "#064057", fontSize: 32, lineHeight: 35 },
  meet: { ...ui.card, borderRadius: 35, alignItems: "center", marginHorizontal: 12 },
  paperPlane: { alignSelf: "center", color: coral, fontSize: 78, transform: [{ rotate: "-35deg" }] },
  timeline: { marginLeft: 30, borderLeftWidth: 4, borderColor: coral, gap: 16 },
  step: { flexDirection: "row", gap: 10, marginLeft: -14, paddingRight: 12 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: coral, backgroundColor: "#F8F6ED" },
  stepTitle: { color: coral, fontSize: 18, fontWeight: "800" },
  stepDescription: { color: coral, fontSize: 16 },
});

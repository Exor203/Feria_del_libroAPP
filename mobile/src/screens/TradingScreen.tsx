import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Image, Text, TextInput, View } from "react-native";
import { Enter, FairScroll, Heading, Pill, ui } from "../components/FairUi";
import { bookCovers } from "../data/bookCovers";
import type { ShelfBook, Trade } from "../services/library";

const dune = { id: "dune", title: "Dune", author: "Frank Herbert" };
const amazing = { id: "amazing", title: "Amazing Fantasy", author: "Marvel Comics" };
const superman = { id: "superman", title: "Action Comics", author: "DC Comics" };
const yuggoth = { id: "yuggoth", title: "Relatos de Yuggoth", author: "Alan Moore" };
const offers = [dune, amazing, superman, yuggoth, { id: "pinocho", title: "Pinocho", author: "Carlo Collodi" }];
const exampleTrades: Trade[] = [
  { id: "demo-pending", offered: offers[4], received: dune, status: "Pendiente" },
  { id: "demo-accepted", offered: { id: "harry", title: "Harry Potter y la Orden del Fénix", author: "J. K. Rowling" }, received: { id: "paciente", title: "La paciente silenciosa", author: "Alex Michaelides" }, status: "Aceptado" },
  { id: "demo-complete", offered: superman, received: { id: "hulk", title: "Wolverine vs. Hulk", author: "Marvel Comics" }, status: "Finalizado" },
];
const coral = "#ED5B47";

export function TradingScreen({ books, trades, ready, onSend, onExit }: {
  books: ShelfBook[]; trades: Trade[]; ready: boolean; onSend: (trade: Trade) => void; onExit: () => void;
}) {
  const [page, setPage] = useState<"explore" | "mine" | "choose" | "review" | "sent" | "detail">("explore");
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
    <View style={{ alignSelf: "flex-start" }}><Pill label="‹ Volver" onPress={goBack} /></View>
    {(page === "explore" || page === "mine") && <>
      <Heading title="Trading" subtitle="Tu llave para nuevos universos" />
      <TextInput accessibilityLabel="Buscar libros o autores" style={ui.input} placeholder="Buscar libros o autores…" value={query} onChangeText={setQuery} />
      <View style={ui.row}>
        <Pill label="Explorar" active={page === "explore"} onPress={() => setPage("explore")} />
        <Pill label="Mis intercambios" active={page === "mine"} onPress={() => setPage("mine")} />
      </View>
      <Text style={ui.body}>Demostración de intercambio</Text>
      {page === "explore" ? offers.filter(matches).map(book => <BookCard key={book.id} book={book}>
        <Pill label="Explorar intercambio" onPress={() => { submitting.current = false; setTarget(book); setOffered(undefined); setPage("choose"); }} />
      </BookCard>) : [...trades, ...exampleTrades].filter(item => matches(item.offered) || matches(item.received)).map(item => <View key={item.id} style={[ui.card, { borderColor: item.status === "Pendiente" ? coral : item.status === "Aceptado" ? "#299788" : "#999" }]}>
        <View style={ui.row}><TradeCover book={item.offered} /><Text style={ui.heading}>↔</Text><TradeCover book={item.received} /></View>
        <Pill label={item.status + " · Ver intercambio"} onPress={() => { setDetail(item); setPage("detail"); }} />
      </View>)}
    </>}
    {(page === "choose" || page === "review") && target && <>
      <Heading title="Propuesta" />
      {page === "choose" ? <>
        <Text style={ui.heading}>Querés obtener</Text><BookCard book={target} />
        <Text style={ui.heading}>¿Qué libro ofrecés?</Text>
        {choices.map(book => <BookCard key={book.id} book={book}>
          <Pill label={book.id === offered?.id ? "Seleccionado" : "Seleccionar"} active={book.id === offered?.id} onPress={() => setOffered(book)} />
        </BookCard>)}
        <Pill label="Continuar →" active disabled={!offered} onPress={() => setPage("review")} />
      </> : offered && <>
        <Text style={ui.heading}>Vos ofrecés</Text><BookCard book={offered} />
        <Text style={ui.heading}>Vos recibís</Text><BookCard book={target} />
        <Text style={ui.body}>Encuentro en la feria (por definir)</Text>
        <Pill label="Enviar propuesta de prueba" active disabled={!ready} onPress={() => {
          if (submitting.current) return;
          submitting.current = true;
          const trade: Trade = { id: `trade-${Date.now()}`, offered, received: target, status: "Pendiente" };
          onSend(trade); setDetail(trade); setPage("sent");
        }} />
      </>}
    </>}
    {(page === "sent" || page === "detail") && detail && <>
      <Heading title={page === "sent" ? "Propuesta registrada" : "Mi intercambio"} subtitle="Demostración local" />
      <BookCard book={detail.offered} /><BookCard book={detail.received} />
      {["Propuesta registrada", "Aceptada", "Punto de encuentro", "Finalizado"].map((step, index) => <Text key={step} style={[ui.heading, { color: coral, opacity: index <= (detail.status === "Finalizado" ? 3 : detail.status === "Aceptado" ? 1 : 0) ? 1 : 0.55 }]}>● {step}</Text>)}
      <Text style={ui.body}>Estado: {detail.status}</Text>
      <Pill label="Ver mis intercambios" active onPress={() => setPage("mine")} />
    </>}
  </FairScroll></Enter>;
}

function TradeCover({ book }: { book: ShelfBook }) {
  const cover = bookCovers[book.id];
  return cover ? <Image source={cover} accessibilityLabel={book.title} style={{ width: 64, height: 94, borderRadius: 9 }} /> :
    <View style={{ width: 64, height: 94, borderRadius: 9, backgroundColor: "#D8E4E8", justifyContent: "center", padding: 5 }}><Text numberOfLines={3} style={{ textAlign: "center" }}>{book.title}</Text></View>;
}
function BookCard({ book, children }: { book: ShelfBook; children?: React.ReactNode }) {
  return <View style={[ui.card, { flexDirection: "row", alignItems: "center" }]}>
    <TradeCover book={book} />
    <View style={{ flex: 1, gap: 5 }}><Text style={ui.heading}>{book.title}</Text><Text style={ui.body}>{book.author}</Text>{children}</View>
  </View>;
}

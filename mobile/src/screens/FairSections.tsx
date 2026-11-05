import { useEffect, useState } from "react";
import { BackHandler, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Enter, FairScroll, Heading, Pill, ui } from "../components/FairUi";

const agenda = [
  ["01", "12:00 a 13:00", "Inauguración del evento", "Auditorio B"],
  ["01", "15:00 a 16:00", "Taller de escritura", "Aula B3"],
  ["01", "18:00 a 19:00", "Taller de dibujo", "Aula B3"],
  ["01", "19:00 a 21:00", "Del guion a la pantalla", "Sala Chalo Tulián"],
  ["02", "12:00 a 13:00", "Taller de escritura", "Aula A2"],
  ["02", "19:30", "Presentación de Liliana B.", "Auditorio A"],
];
const notices = [["01", "15:00", "Presentación de Sacheri", "Auditorio B"], ...agenda.slice(1)];
const artists = [
  { name: "Martín Kohan", genre: "Historia y literatura", image: require("../../assets/mockups/kohan.png") },
  { name: "Eduardo Sacheri", genre: "Historia y literatura", image: require("../../assets/mockups/sacheri-thumb.png") },
  { name: "Agustina Bazterrica", genre: "Narrativa y ficción", image: require("../../assets/mockups/bazterrica.png") },
  { name: "Claudia Kutnowski", genre: "Ciencia y ensayos", image: require("../../assets/mockups/kutnowski.png") },
  { name: "Mauro Serafini", genre: "Cómics y manuales", image: require("../../assets/mockups/serafini.png") },
];
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function EventsPreview({ initialTab }: { initialTab: "agenda" | "anuncios" }) {
  const [tab, setTab] = useState(initialTab);
  const [detail, setDetail] = useState<string[]>();
  useEffect(() => {
    if (!detail) return;
    const back = BackHandler.addEventListener("hardwareBackPress", () => { setDetail(undefined); return true; });
    return () => back.remove();
  }, [detail]);
  return <Enter change={detail?.join() ?? tab}><FairScroll>
    <Heading title={tab === "agenda" ? "Agenda" : "Anuncios"} subtitle="No te pierdas nuevas experiencias" />
    {detail ? <>
      <Pill label="Volver al listado" onPress={() => setDetail(undefined)} />
      <View style={ui.card}><Text style={ui.heading}>{detail[2]}</Text><Text style={ui.body}>{detail[0]} Oct · {detail[1]}</Text><Text style={ui.body}>{detail[3]}</Text></View>
    </> : <>
      <View style={ui.row}><Pill label="Agenda" active={tab === "agenda"} onPress={() => setTab("agenda")} /><Pill label="Anuncios" active={tab === "anuncios"} onPress={() => setTab("anuncios")} /></View>
      {(tab === "agenda" ? agenda : notices).map((item, index) => <Pressable key={item.join()} accessibilityRole="button" onPress={() => setDetail(item)} style={[ui.card, { flexDirection: "row", alignItems: "center", padding: 0, paddingRight: 12, overflow: "hidden" }]}>
        {tab === "anuncios" && index === 0 ? <Image source={artists[1].image} style={{ width: 68, height: 86 }} /> :
          <View style={{ width: 68, minHeight: 86, justifyContent: "center", backgroundColor: item[0] === "01" ? "#F34F43" : "#203C78" }}>
            <Text style={{ color: "white", fontWeight: "800", fontSize: 21, textAlign: "center" }}>{item[0]}{"\n"}Oct</Text>
          </View>}
        <View style={{ flex: 1, paddingVertical: 8 }}>
          <Text style={{ color: item[0] === "01" ? "#AA392E" : "#203C78" }}>{item[1]}</Text>
          <Text style={[ui.heading, { fontSize: 17 }]}>{item[2]}</Text>
          <Text style={ui.body}>{item[3]}</Text>
        </View><Text style={ui.heading}>›</Text>
      </Pressable>)}
    </>}
    <Text style={ui.body}>Agenda y anuncios de demostración.</Text>
  </FairScroll></Enter>;
}

const works = [
  ["El secreto de sus ojos", require("../../Portada de libros/El secreto de sus ojos.jpg")],
  ["La pregunta de sus ojos", require("../../Portada de libros/la-pregunta-de-sus-ojos.webp")],
] as const;

export function ArtistsPreview() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof artists)[number]>();
  useEffect(() => {
    if (!selected) return;
    const back = BackHandler.addEventListener("hardwareBackPress", () => { setSelected(undefined); return true; });
    return () => back.remove();
  }, [selected]);
  return <Enter change={selected?.name ?? "artists"}><FairScroll>
    {selected ? <>
      <Pill label="Volver a artistas" onPress={() => setSelected(undefined)} />
      <Image resizeMode={selected === artists[1] ? "cover" : "contain"} source={selected === artists[1] ? require("../../assets/mockups/sacheri.png") : selected.image} accessibilityLabel={selected.name} style={{ width: "100%", height: 225, borderRadius: 18 }} />
      <Heading title={selected.name} subtitle={selected === artists[1] ? "Escritor y guionista" : selected.genre} />
      {selected === artists[1] && <>
        <Text style={ui.body}>Escritor argentino y autor de La pregunta de sus ojos. Sus historias exploran la memoria, la amistad y la vida cotidiana.</Text>
        <Text style={ui.heading}>Obras destacadas</Text>
        <ScrollView horizontal contentContainerStyle={{ gap: 14 }}>{works.map(([title, image]) => <View key={title} style={{ width: 92 }}>
          <Image source={image} style={{ width: 92, height: 134, borderRadius: 9 }} /><Text style={ui.body}>{title}</Text>
        </View>)}</ScrollView>
      </>}
    </> : <>
      <Heading title="Artistas" subtitle="Conocé a tus artistas favoritos" />
      <TextInput style={ui.input} accessibilityLabel="Buscar autores" placeholder="Buscar autores" value={query} onChangeText={setQuery} />
      <Pill label={filter ?? "Filtrar por género"} onPress={() => setFiltersOpen(value => !value)} />
      {filtersOpen && <View style={ui.row}>{[undefined, ...new Set(artists.map(artist => artist.genre))].map(genre => <Pill key={genre ?? "all"} active={genre === filter} label={genre ?? "Todos"} onPress={() => { setFilter(genre); setFiltersOpen(false); }} />)}</View>}
      {artists.filter(artist => (!filter || artist.genre === filter) && normalize(artist.name).includes(normalize(query.trim()))).map(artist => <Pressable key={artist.name} accessibilityRole="button" onPress={() => setSelected(artist)} style={[ui.card, { flexDirection: "row", padding: 0, alignItems: "center", paddingRight: 12, overflow: "hidden" }]}>
        <Image source={artist.image} style={{ width: 88, height: 88 }} />
        <View style={{ flex: 1, paddingVertical: 8 }}><Text style={ui.heading}>{artist.name}</Text><Text style={ui.body}>{artist.genre}</Text></View>
        <Text style={ui.heading}>›</Text>
      </Pressable>)}
    </>}
  </FairScroll></Enter>;
}

export function MapPreview() {
  return <FairScroll>
    <Heading title="Mapa" />
    <View style={[ui.card, { alignSelf: "flex-start" }]}>
      <Text style={ui.heading}>Referencias</Text>
      {[["#E90085", "Stands"], ["#C5EA58", "Escenario"], ["#9DD9F8", "Servicios"], ["#FF9A00", "Aulas"]].map(([color, title]) => <View key={title} style={ui.row}>
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: color }} /><Text style={ui.body}>{title}</Text>
      </View>)}
      <Text style={ui.body}>Escaleras · Baños · Salida</Text>
    </View>
    <Image source={require("../../assets/mockups/plano.png")} resizeMode="contain" accessibilityLabel="Plano de referencia del predio" style={{ width: "100%", aspectRatio: 380 / 266 }} />
    <Text style={ui.body}>Plano de referencia.</Text>
  </FairScroll>;
}

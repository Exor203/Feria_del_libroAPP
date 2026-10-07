import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { books } from "../data/catalogoInicial";
import { Cover } from "./BooksScreen";
import { ReferencePortrait } from "../components/ReferenceArt";

type Props = { onBook: (id: string) => void; onArtists: () => void };
const slides = ["La feria en tus manos", "Encontrá tu próximo libro", "Descubrí encuentros y autores", "Viví historias, compartí lecturas"];
const days = ["Jueves", "Viernes", "Sábado", "Domingo", "Lunes", "Martes"];

export default function HomeScreen({ onBook, onArtists }: Props) {
  const [slide, setSlide] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 560);
  const tileWidth = (contentWidth - 24) / 3;
  const dayWidth = Math.max(48, (contentWidth - 25) / 6);
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
    <View style={s.hero}>
      <Text accessibilityRole="header" style={s.brand}>FERIA DEL LIBRO</Text>
      <Text style={s.tagline} accessibilityLiveRegion="polite">{slides[slide]}</Text>
      <View style={s.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel="Diapositiva anterior" onPress={() => setSlide((slide + 3) % 4)} style={s.arrowButton}><Text style={s.arrow}>‹</Text></Pressable>
        {slides.map((_, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Diapositiva ${index + 1} de 4`} accessibilityState={{ selected: slide === index }} onPress={() => setSlide(index)} style={s.dotButton}><View style={[s.dot, slide === index && s.dotActive]} /></Pressable>)}
        <Pressable accessibilityRole="button" accessibilityLabel="Diapositiva siguiente" onPress={() => setSlide((slide + 1) % 4)} style={s.arrowButton}><Text style={s.arrow}>›</Text></Pressable>
      </View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.calendar}>
      {days.map((day, index) => <Pressable key={day} accessibilityRole="button" accessibilityLabel={`${index + 1} de octubre, ${day}`} accessibilityState={{ selected: selectedDay === index }} onPress={() => setSelectedDay(index)} style={[s.day, { width: dayWidth }, selectedDay === index && s.dayActive]}>
        <Text style={[s.dayDate, selectedDay === index && s.dayTextActive]}>0{index + 1} Oct</Text>
        <Text style={[s.dayName, selectedDay === index && s.dayTextActive]}>{day}</Text>
      </Pressable>)}
    </ScrollView>
    <View style={s.section}>
      <Text accessibilityRole="header" style={s.heading}>Top Ventas de la Feria</Text>
      <View style={s.row}>{[books[1], books[0], books[2]].map(book => <Pressable key={book.id} accessibilityRole="button" accessibilityLabel={`Ver ${book.title}`} onPress={() => onBook(book.id)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}><Cover book={book} width={tileWidth} /></Pressable>)}</View>
    </View>
    <View style={s.section}>
      <Text accessibilityRole="header" style={s.heading}>Artistas en Tendencia</Text>
      <View style={s.row}>{[0, 1, 2].map(index => <Pressable key={index} accessibilityRole="button" accessibilityLabel="Abrir sección de artistas" onPress={onArtists} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}><ReferencePortrait index={index} width={tileWidth} /></Pressable>)}</View>
      <Text style={s.demo}>Selecciones y fotos de ejemplo del boceto.</Text>
    </View>
  </ScrollView>;
}

const s = StyleSheet.create({
  content: { padding: 20, paddingBottom: 120, width: "100%", maxWidth: 600, alignSelf: "center" },
  hero: { backgroundColor: "#0C4358", borderRadius: 30, minHeight: 205, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingTop: 36, paddingBottom: 14 },
  brand: { color: "#F4A62A", fontSize: 26, fontWeight: "800", textAlign: "center" }, tagline: { color: "white", fontSize: 19, textAlign: "center", marginTop: 8, minHeight: 50 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10 }, arrowButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, arrow: { color: "white", fontSize: 36, lineHeight: 40 },
  dotButton: { width: 30, height: 44, alignItems: "center", justifyContent: "center" }, dot: { backgroundColor: "white", borderRadius: 5, height: 7, width: 13 }, dotActive: { backgroundColor: "#F4A62A", width: 26 },
  calendar: { gap: 5, paddingTop: 10, paddingBottom: 4 }, day: { borderColor: "#0C4358", borderWidth: 1.5, borderRadius: 13, height: 77, paddingTop: 8, alignItems: "center" }, dayActive: { backgroundColor: "#0C4358" }, dayDate: { color: "#0C4358", fontSize: 11, fontWeight: "700" }, dayName: { color: "#0C4358", fontSize: 10, fontWeight: "700" }, dayTextActive: { color: "#F4A62A" },
  section: { marginTop: 28, gap: 10 }, heading: { color: "#0C4358", fontSize: 18, fontWeight: "700" }, row: { flexDirection: "row", gap: 12 }, demo: { color: "#657173", fontSize: 11 },
});

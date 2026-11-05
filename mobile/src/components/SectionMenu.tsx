import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { MenuArt } from "./MenuArt";
import { FairBackdrop } from "./FairUi";

export type MenuDestination = "books" | "exchange" | "events" | "map" | "artists" | "camera" | "assistant" | "game" | "profile";
type Props = { visible: boolean; onClose: () => void; onSelect: (destination: MenuDestination) => void };

export default function SectionMenu({ visible, onClose, onSelect }: Props) {
  const { height } = useWindowDimensions();
  const item = (destination: MenuDestination, label: string) => <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${label}`} onPress={() => onSelect(destination)} style={s.item}>
    <MenuArt name={destination} size={destination === "events" ? 65 : 52} /><Text style={[s.label, { color: colors[destination] }]}>{label}</Text>
  </Pressable>;
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={s.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar menú" onPress={onClose} style={s.backdrop} />
      <View style={[s.sheet, { maxHeight: height * 0.77 }]}>
        <FairBackdrop section="home" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          <Text accessibilityRole="header" style={s.title}>Acceso a pestañas</Text>
          <Text style={s.subtitle}>Tu viaje comienza aquí</Text>
          <View style={s.destinations}>
            <View style={s.pair}>{item("books", "LIBROS")}{item("exchange", "TRADING")}</View>
            <View style={s.pair}>{item("game", "JUEGO")}{item("events", "EVENTOS")}{item("map", "MAPA")}</View>
            <View style={s.pair}>{item("artists", "ARTISTAS")}{item("assistant", "CHAT BOT")}</View>
          </View>
        </ScrollView>
        <View style={s.footer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir Cámara" onPress={() => onSelect("camera")} style={s.footerItem}><MenuArt name="camera" size={44} /><Text style={s.footerLabel}>CÁMARA</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar menú de secciones" onPress={onClose} style={s.closeBook}><MenuArt name="bookOpen" size={65} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir Perfil" onPress={() => onSelect("profile")} style={s.footerItem}><MenuArt name="profile" size={44} /><Text style={s.footerLabel}>PERFIL</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}

const colors: Record<MenuDestination, string> = { books: "#064057", exchange: "#ED5B47", game: "#1CB3D6", events: "#EA7C35", map: "#289686", artists: "#EB4A78", assistant: "#927EB5", camera: "#ED8175", profile: "#ED8175" };

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.24)", justifyContent: "flex-end" }, backdrop: { flex: 1 },
  sheet: { backgroundColor: "#FFF6E5", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden", width: "100%", maxWidth: 600, alignSelf: "center", paddingTop: 16 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 10 }, title: { color: "#0C4358", fontSize: 26, fontWeight: "300", textAlign: "center" }, subtitle: { color: "#0C4358", fontSize: 17, textAlign: "center", marginTop: 3 },
  destinations: { marginTop: 16, gap: 8 }, pair: { flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }, center: { alignItems: "center", marginVertical: 2 }, item: { minWidth: 74, alignItems: "center", gap: 7, paddingVertical: 4 },
  label: { color: "#0C4358", fontSize: 14, fontWeight: "600" }, eventsText: { color: "#EA7C35" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", paddingTop: 14, paddingBottom: 20, marginHorizontal: 32, borderTopColor: "#064057", borderTopWidth: 1 }, footerItem: { alignItems: "center", gap: 7, minWidth: 90, paddingVertical: 4 }, footerLabel: { color: "#ED8175", fontSize: 12, fontWeight: "600" }, closeBook: { padding: 4 },
});

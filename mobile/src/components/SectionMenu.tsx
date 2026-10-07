import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { ReferenceIcon, type IconName } from "../components/ReferenceArt";

export type MenuDestination = "books" | "exchange" | "events" | "map" | "artists" | "camera" | "assistant";
type Props = { visible: boolean; onClose: () => void; onSelect: (destination: MenuDestination) => void };

export default function SectionMenu({ visible, onClose, onSelect }: Props) {
  const { height } = useWindowDimensions();
  const item = (destination: MenuDestination, label: string, name: IconName = destination) => <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${label}`} onPress={() => onSelect(destination)} style={s.item}>
    <ReferenceIcon name={name} size={64} /><Text style={[s.label, destination === "events" && s.eventsText]}>{label}</Text>
  </Pressable>;
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={s.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar menú" onPress={onClose} style={s.backdrop} />
      <View style={[s.sheet, { maxHeight: height * 0.77 }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          <Text accessibilityRole="header" style={s.title}>Acceso a pestañas</Text>
          <Text style={s.subtitle}>Tu viaje comienza aquí</Text>
          <View style={s.destinations}>
            <View style={s.pair}>{item("books", "LIBROS")}{item("exchange", "INTERCAMBIO")}</View>
            <View style={s.center}>{item("events", "EVENTOS")}</View>
            <View style={s.pair}>{item("map", "MAPA")}{item("artists", "ARTISTAS")}</View>
          </View>
        </ScrollView>
        <View style={s.footer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir Cámara" onPress={() => onSelect("camera")} style={s.footerItem}><ReferenceIcon name="camera" size={48} /><Text style={s.footerLabel}>CÁMARA</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar menú de secciones" onPress={onClose} style={s.closeBook}><ReferenceIcon name="bookOpen" size={72} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir Asistente" onPress={() => onSelect("assistant")} style={s.footerItem}><ReferenceIcon name="assistant" size={48} /><Text style={s.footerLabel}>ASISTENTE</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.24)", justifyContent: "flex-end" }, backdrop: { flex: 1 },
  sheet: { backgroundColor: "#FFF6E5", borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", maxWidth: 600, alignSelf: "center", paddingTop: 16 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 10 }, title: { color: "#0C4358", fontSize: 26, fontWeight: "800", textAlign: "center" }, subtitle: { color: "#0C4358", fontSize: 17, textAlign: "center", marginTop: 3 },
  destinations: { marginTop: 24 }, pair: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12 }, center: { alignItems: "center", marginVertical: 2 }, item: { minWidth: 112, alignItems: "center", gap: 7, paddingVertical: 4 },
  label: { color: "#0C4358", fontSize: 14, fontWeight: "600" }, eventsText: { color: "#EA7C35" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", paddingTop: 12, paddingBottom: 20 }, footerItem: { alignItems: "center", gap: 7, minWidth: 90, paddingVertical: 4 }, footerLabel: { color: "#B96D0E", fontSize: 12, fontWeight: "600" }, closeBook: { padding: 4 },
});

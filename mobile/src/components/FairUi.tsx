import { useEffect, useRef, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export const ink = "#064057";
export const paper = "#F8F6ED";
export const tones: Record<string, string> = {
  home: "#F6EBD5", books: "#CCDADF", artists: "#F8D4DF", exchange: "#FAD1C9",
  events: "#FADBC6", map: "#B2D8D2", assistant: "#DAD4EA", game: "#DEF3F9",
  profile: "#E2EBE2", camera: "#F6EBD5", login: "#F6EBD5",
};

export function FairBackdrop({ section }: { section: string }) {
  const tone = tones[section] ?? paper;
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%">
      <Defs><LinearGradient id="section" x1="0%" y1="0%" x2="80%" y2="100%">
        <Stop offset="0%" stopColor={section === "home" || section === "login" ? "#FFFFFF" : tone} /><Stop offset={section === "home" || section === "login" ? "28%" : "42%"} stopColor="#FFFFFF" />
        <Stop offset={section === "home" || section === "login" ? "80%" : "100%"} stopColor={tone} />
      </LinearGradient></Defs>
      <Rect width="100%" height="100%" fill="url(#section)" />
    </Svg>
  </View>;
}

export function Enter({ children, change }: { children: ReactNode; change: string }) {
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!active || reduced) return;
      progress.setValue(0);
      Animated.timing(progress, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    }).catch(() => {});
    return () => { active = false; progress.stopAnimation(); progress.setValue(1); };
  }, [change, progress]);
  return <Animated.View style={{ flex: 1, opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>{children}</Animated.View>;
}

export function FairScroll({ children }: { children: ReactNode }) {
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>{children}</ScrollView>;
}
export function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View><Text accessibilityRole="header" style={ui.title}>{title}</Text>{subtitle && <Text style={ui.subtitle}>{subtitle}</Text>}</View>;
}
export function Pill({ label, onPress, active = false, disabled = false }: { label: string; onPress: () => void; active?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [ui.pill, active && { backgroundColor: ink }, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
    <Text style={{ color: active ? paper : ink, fontWeight: "700", textAlign: "center" }}>{label}</Text>
  </Pressable>;
}
export const ui = StyleSheet.create({
  content: { width: "100%", maxWidth: 600, alignSelf: "center", padding: 22, paddingBottom: 110, gap: 14 },
  title: { color: ink, fontSize: 32, fontWeight: "900", textAlign: "right" },
  subtitle: { color: ink, textAlign: "right" },
  heading: { color: ink, fontSize: 20, fontWeight: "800" },
  body: { color: ink, fontSize: 16, lineHeight: 23 },
  card: { backgroundColor: paper, borderWidth: 1.5, borderColor: ink, borderRadius: 22, padding: 14, gap: 9 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  pill: { minHeight: 42, borderRadius: 24, borderWidth: 1.5, borderColor: ink, backgroundColor: paper, paddingHorizontal: 16, paddingVertical: 9, justifyContent: "center" },
  input: { minHeight: 44, borderRadius: 24, borderWidth: 1, borderColor: ink, backgroundColor: paper, paddingHorizontal: 16, color: ink },
});

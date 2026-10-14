import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { askAssistant, assistantConfigured } from "../services/assistantService";
import { friendlyAssistantError, MAX_MESSAGE_LENGTH, type ChatTurn } from "../services/assistantPolicy";

type Message = { id: number; role: "user" | "model"; text: string };
type Props = { onBooks: () => void; onEvents: () => void };
const suggestions = ["Recomendame un libro de ciencia ficción", "¿Dónde está El Eternauta?", "¿Qué eventos hay?"];

export default function AssistantScreen({ onBooks, onEvents }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const history = useRef<ChatTurn[]>([]);
  const busy = useRef(false);
  const mounted = useRef(true);
  const counter = useRef(0);
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const send = async (value: string, retry = false) => {
    const query = value.trim();
    if (!query || busy.current || !assistantConfigured) return;
    busy.current = true; setLoading(true); setError(null); setFailedPrompt(null);
    if (!retry) setMessages(items => [...items, { id: ++counter.current, role: "user", text: query }]);
    setDraft("");
    try {
      const response = await askAssistant(query, history.current);
      if (!mounted.current) return;
      history.current.push({ role: "user", text: query }, { role: "model", text: response });
      setMessages(items => [...items, { id: ++counter.current, role: "model", text: response }]);
    } catch (problem) {
      if (!mounted.current) return;
      const specific = problem instanceof Error && /Esperá|límite local/.test(problem.message) ? problem.message : friendlyAssistantError(problem);
      setError(specific); setFailedPrompt(query);
    } finally { busy.current = false; if (mounted.current) setLoading(false); }
  };
  const clear = () => { if (busy.current) return; setMessages([]); history.current = []; setError(null); setFailedPrompt(null); setDraft(""); };
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
    <View style={s.heading}><View style={s.badge}><Text style={s.badgeText}>IA</Text></View><View style={s.headingCopy}><Text style={s.title}>Tu guía de la feria</Text><Text style={s.subtitle}>{assistantConfigured ? "Gemini · prueba de conversación" : "Pendiente de conectar la IA"}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Nueva conversación" disabled={loading} onPress={clear} style={s.newChat}><Text style={s.link}>Nueva</Text></Pressable></View>
    <View style={s.notice}><Text style={s.noticeText}>{assistantConfigured ? "Catálogo de demostración. Confirmá stock, agenda y ubicaciones en la feria." : "Estamos preparando el acceso a la IA. Mientras tanto podés consultar Libros y Agenda sin usar el chat."}</Text></View>
    <View style={s.shortcuts}><Pressable accessibilityRole="button" onPress={onBooks} style={s.shortcut}><Text style={s.link}>Ver libros</Text></Pressable><Pressable accessibilityRole="button" onPress={onEvents} style={s.shortcut}><Text style={s.link}>Ver agenda</Text></Pressable></View>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={s.messages} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
      <View style={[s.bubble, s.model]}><Text style={s.message}>¡Hola! Te puedo ayudar a descubrir libros y consultar la información de la feria.</Text></View>
      {!messages.length && assistantConfigured && <View style={s.suggestions}>{suggestions.map(prompt => <Pressable key={prompt} accessibilityRole="button" disabled={loading} onPress={() => void send(prompt)} style={s.suggestion}><Text style={s.link}>{prompt}</Text></Pressable>)}</View>}
      {messages.map(message => <View key={message.id} style={[s.bubble, message.role === "user" ? s.user : s.model]}><Text style={[s.speaker, message.role === "user" && s.white]}>{message.role === "user" ? "Vos" : "Asistente IA"}</Text><Text selectable style={[s.message, message.role === "user" && s.white]}>{message.text}</Text></View>)}
      {loading && <View accessibilityLiveRegion="polite" style={s.loading}><ActivityIndicator color="#0C4358" /><Text style={s.subtitle}>Pensando una respuesta…</Text></View>}
      {error && <View style={s.errorBox}><Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{error}</Text>{failedPrompt && <Pressable accessibilityRole="button" disabled={loading} onPress={() => void send(failedPrompt, true)} style={s.retry}><Text style={s.link}>Reintentar</Text></Pressable>}</View>}
    </ScrollView>
    <View style={s.composer}><TextInput accessibilityLabel="Consulta al asistente" value={draft} onChangeText={setDraft} editable={assistantConfigured && !loading} placeholder={assistantConfigured ? "Preguntá por un libro o evento…" : "IA pendiente de conexión"} placeholderTextColor="#63727A" multiline maxLength={MAX_MESSAGE_LENGTH} style={s.input} /><Pressable accessibilityRole="button" accessibilityLabel="Enviar consulta" disabled={!assistantConfigured || loading || !draft.trim()} onPress={() => void send(draft)} style={[s.send, (!assistantConfigured || loading || !draft.trim()) && s.disabled]}><Text style={s.sendText}>↑</Text></Pressable></View>
    <Text style={s.footer}>{draft.length}/{MAX_MESSAGE_LENGTH} · La IA puede equivocarse.</Text>
  </KeyboardAvoidingView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, paddingBottom: 100 }, heading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 }, badge: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#F4A62A", justifyContent: "center", alignItems: "center" }, badgeText: { color: "#0C4358", fontWeight: "800" }, headingCopy: { flex: 1 }, title: { color: "#0C4358", fontSize: 19, fontWeight: "800" }, subtitle: { color: "#63727A", fontSize: 12 }, newChat: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }, link: { color: "#0C4358", fontWeight: "600", fontSize: 13 },
  notice: { marginHorizontal: 16, padding: 12, backgroundColor: "#F4E7CF", borderRadius: 12 }, noticeText: { color: "#4B514A", fontSize: 12, lineHeight: 18 }, shortcuts: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 8 }, shortcut: { paddingHorizontal: 12, minHeight: 44, justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#CBD4D3" },
  messages: { padding: 16, gap: 14 }, bubble: { maxWidth: "90%", padding: 14, borderRadius: 17 }, model: { alignSelf: "flex-start", backgroundColor: "white", borderBottomLeftRadius: 4 }, user: { alignSelf: "flex-end", backgroundColor: "#0C4358", borderBottomRightRadius: 4 }, message: { color: "#26363C", fontSize: 15, lineHeight: 22 }, white: { color: "white" }, speaker: { color: "#0C4358", fontWeight: "700", fontSize: 11, marginBottom: 5 }, suggestions: { gap: 8 }, suggestion: { padding: 12, minHeight: 44, borderWidth: 1, borderColor: "#C5D2D1", borderRadius: 13 }, loading: { flexDirection: "row", alignItems: "center", gap: 8 }, errorBox: { backgroundColor: "#FBE9E3", borderRadius: 12, padding: 12 }, error: { color: "#98372D", lineHeight: 20 }, retry: { minHeight: 44, justifyContent: "center" },
  composer: { flexDirection: "row", alignItems: "flex-end", marginHorizontal: 16, gap: 10, marginTop: 6 }, input: { flex: 1, maxHeight: 100, minHeight: 48, borderWidth: 1, borderColor: "#0C4358", borderRadius: 15, backgroundColor: "white", paddingHorizontal: 12, paddingVertical: 11, color: "#26363C", fontSize: 15 }, send: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#00756F", alignItems: "center", justifyContent: "center" }, sendText: { color: "white", fontSize: 28 }, disabled: { opacity: 0.35 }, footer: { color: "#63727A", fontSize: 10, marginLeft: 18, marginTop: 5 },
});

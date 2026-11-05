import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_900Black } from "@expo-google-fonts/nunito";
import { Enter, Heading } from "../components/FairUi";
import GameIcon from "../components/GameIcon";
import { MenuArt } from "../components/MenuArt";
import { readerQuestions } from "../data/readerQuestions";
import { advantageLabel, categories, fiftyFifty, pickQuestion, roundMs, scoreAnswer, type Advantage } from "../services/readerGame";

const accent = { Autores: "#684A83", Géneros: "#18734F", Editoriales: "#A34530", Feria: "#235C99" };
const petrol = "#0C4358";
const cream = "#FFF6E5";

export default function GameScreen({ onExit, onRoundMode }: { onExit: () => void; onRoundMode: (active: boolean) => void }) {
  const [fonts] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_900Black });
  const [page, setPage] = useState<"start" | "rules" | "question" | "feedback" | "result">("start");
  const [round, setRound] = useState<ReturnType<typeof pickQuestion> | null>(null);
  const [remaining, setRemaining] = useState(30);
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [used, setUsed] = useState<Advantage | null>(null);
  const [showAdvantages, setShowAdvantages] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof scoreAnswer> | null>(null);
  const clock = useRef({ start: 0, end: 0 });
  const locked = useRef(true);
  const advantageUsed = useRef(false);
  const seen = useRef(new Set<string>());

  const next = () => {
    if (!locked.current || page === "question" || page === "feedback") return;
    if (seen.current.size === readerQuestions.length) seen.current.clear();
    const upcoming = pickQuestion(readerQuestions, seen.current, round ?? undefined);
    seen.current.add(upcoming.question.id);
    const now = Date.now();
    clock.current = { start: now, end: now + roundMs };
    locked.current = false;
    advantageUsed.current = false;
    setRound(upcoming);
    setRemaining(30);
    setUsed(null);
    setHidden([]);
    setSelected(null);
    setResult(null);
    setShowAdvantages(false);
    setPage("question");
  };

  const finish = useCallback((answer: string | null, now: number) => {
    if (locked.current || !round || (answer !== null && hidden.includes(answer))) return;
    locked.current = true;
    const choice = now < clock.current.end ? answer : null;
    const outcome = scoreAnswer(choice === round.question.correct, now - clock.current.start);
    setSelected(choice);
    setResult(outcome);
    setShowAdvantages(false);
    setRemaining(Math.max(0, Math.ceil((clock.current.end - now) / 1000)));
    if (outcome.reward) {
      const reward = outcome.reward;
      setAdvantages(current => [...current, reward]);
    }
    setPage(choice === null ? "result" : "feedback");
  }, [hidden, round]);

  useEffect(() => {
    if (page !== "question") return;
    const timer = setInterval(() => {
      if (locked.current) return;
      const now = Date.now();
      if (now >= clock.current.end) finish(null, now);
      else setRemaining(Math.ceil((clock.current.end - now) / 1000));
    }, 100);
    return () => clearInterval(timer);
  }, [finish, page]);

  useEffect(() => {
    if (page !== "feedback") return;
    const timer = setTimeout(() => setPage("result"), 1000);
    return () => clearTimeout(timer);
  }, [page]);

  const leaveGame = useCallback(() => {
    Alert.alert("¿Estás seguro de que querés salir?", "Se perderán las ventajas de esta partida.", [
      { text: "Seguir jugando", style: "cancel" },
      { text: "Volver al inicio", style: "destructive", onPress: () => {
        locked.current = true;
        setShowAdvantages(false);
        onExit();
      } },
    ], { cancelable: true });
  }, [onExit]);

  const back = useCallback(() => {
    if (showAdvantages) setShowAdvantages(false);
    else if (page === "start") onExit();
    else if (page === "rules") setPage("start");
    else leaveGame();
  }, [leaveGame, onExit, page, showAdvantages]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      back();
      return true;
    });
    return () => subscription.remove();
  }, [back]);

  function useAdvantage(advantage: Advantage, index: number) {
    if (locked.current || advantageUsed.current || !round) return;
    const now = Date.now();
    if (now >= clock.current.end) {
      finish(null, now);
      return;
    }
    advantageUsed.current = true;
    setUsed(advantage);
    setShowAdvantages(false);
    setAdvantages(current => current.filter((_, position) => position !== index));
    if (advantage.kind === "Tiempo extra") {
      clock.current.end += advantage.seconds * 1000;
      setRemaining(Math.ceil((clock.current.end - now) / 1000));
    }
    if (advantage.kind === "50/50") setHidden(fiftyFifty(round.options, round.question.correct));
  }

  const inRound = page === "question" || page === "feedback" || page === "result";
  useEffect(() => { onRoundMode(inRound); return () => onRoundMode(false); }, [inRound, onRoundMode]);
  const correct = Boolean(result?.spaces);
  return <View style={s.screen}>
    {!inRound && <View style={s.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={back} hitSlop={8} style={s.back}>
        <Text style={s.barText}>‹ Volver</Text>
      </Pressable>
    </View>}
    <Enter change={page === "feedback" ? "question" : page}><ScrollView key={page === "feedback" ? "question" : page} contentContainerStyle={[s.content, inRound && { paddingTop: page === "result" ? 56 : 72, flexGrow: 1 }]} >
      {page === "start" && <>
        <View style={s.hero}>
          <View style={{ alignSelf: "stretch" }}><Heading title="Juego" subtitle="Trivia literaria de la feria" /></View>
          <Image source={require("../../assets/mockups/juego.png")} style={{ width: "100%", aspectRatio: 364 / 205 }} resizeMode="contain" accessibilityIgnoresInvertColors />
          <View style={s.intro}><GameIcon trophy size={58} /><Text style={[s.introText, s.label]}>Un juego de preguntas y respuestas sobre libros, autores, editoriales y todo el mundo literario</Text></View>
          <View style={s.intro}><Text style={s.people}>♟♟</Text><Text style={[s.introText, s.label]}>2 a 4 jugadores</Text></View>
        </View>
        <Button label="Jugar   →" onPress={next} primary />
        <Button label="¿Cómo se juega?" onPress={() => setPage("rules")} />
        <View style={s.categories}>{categories.map((category, index) => <Badge key={category} text={["♙", "♧", "▱", "⌂"][index] + "  " + category} color={petrol} />)}</View>
      </>}
      {page === "rules" && <>
        <Text accessibilityRole="header" style={[s.rulesTitle, fonts && { fontFamily: "Nunito_900Black", fontWeight: "normal" }]}>¿Cómo se juega?</Text>
        <View style={s.rulesBlock}>
          <Text style={[s.heading, fonts && { fontFamily: "Nunito_700Bold", fontWeight: "normal" }]}>Reglas</Text>
          <Text style={[s.rulesBody, fonts && { fontFamily: "Nunito_400Regular" }]}>Cada jugador pone su ficha en el punto de inicio. En tu turno, tenés 30 segundos para responder una pregunta aleatoria.</Text>
          <Text style={[s.rulesBody, fonts && { fontFamily: "Nunito_400Regular" }]}>• Hasta 10 s: avanzá 3 casilleros.{"\n"}• Más de 10 y hasta 20 s: avanzá 2.{"\n"}• Más de 20 s: avanzá 1 si acertás a tiempo.{"\n"}• Si errás o se acaba el tiempo: 0 casilleros.</Text>
          <Text style={[s.rulesBody, fonts && { fontFamily: "Nunito_400Regular" }]}>Pasale el teléfono a quien sigue y tocá Siguiente cuando esté listo. El reloj arranca enseguida.</Text>
          <Text style={[s.rulesBody, fonts && { fontFamily: "Nunito_600SemiBold" }]}>Las insignias se consiguen en sectores del tablero físico. Reuní 4 de géneros distintos y volvé al centro para el desafío final.</Text>
        </View>
        <View style={s.rulesBlock}>
          <Text style={[s.heading, fonts && { fontFamily: "Nunito_700Bold", fontWeight: "normal" }]}>Ventajas</Text>
          <Text style={[s.rulesBody, fonts && { fontFamily: "Nunito_400Regular" }]}>Si acertás en hasta 10 s, ganás una ventaja. Si acertás después de 10 s y hasta los 20 s, tenés un 50 % de probabilidad de ganar una. Se guardan para los próximos turnos en el teléfono y podés usar una por pregunta. Al ganar, las probabilidades son 40 % Pista, 40 % Tiempo extra y 20 % 50/50.</Text>
          <Text style={[s.rulesBody, fonts && { fontFamily: "Nunito_400Regular" }]}>Pista · Muestra una ayuda sobre la pregunta.{"\n"}Tiempo extra · Suma 10 s si la ganaste en el primer tramo o 5 s si fue en el segundo.{"\n"}50/50 · Elimina dos opciones incorrectas.</Text>
        </View>
        <Button label="Jugar   →" onPress={next} primary />
      </>}
      {round && (page === "question" || page === "feedback") && <>
        <View style={s.status}>
          <Badge text={round.question.category} color={accent[round.question.category]} />
          <Badge text={`00:${String(remaining).padStart(2, "0")}`} color={remaining <= 5 ? "#A34530" : accent[round.question.category]} />
        </View>
        <Text accessibilityRole="header" style={[s.title, { textAlign: "center", color: "#101010", fontSize: 37, fontWeight: "600", marginVertical: 15 }]}>{round.question.prompt}</Text>
        <Image source={require("../../assets/mockups/buho.png")} style={{ width: 138, height: 157, alignSelf: "center" }} resizeMode="contain" accessibilityIgnoresInvertColors />
        {used?.kind === "Pista" && <View style={s.card}><Text style={s.body}>Pista · {round.question.hint}</Text></View>}
        {round.options.map((option, index) => !hidden.includes(option) &&
          <Button key={option} optionLetter={"ABDC"[index]} label={option}
            primary={option === selected} color={option === selected ? (correct ? "#18734F" : "#A34530") : petrol}
            disabled={page === "feedback"} onPress={() => finish(option, Date.now())} />
        )}
        {page === "feedback" && <Text accessibilityLiveRegion="polite" style={s.feedback}>{correct ? "¡Correcto!" : "Respuesta incorrecta"}</Text>}

      </>}
      {round && page === "result" && result && <>
        <View style={s.hero}>
          <View style={{ width: 142, height: 142, borderRadius: 71, backgroundColor: correct ? "#18734F" : "#A34530", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 94, color: cream }}>{correct ? "✓" : "×"}</Text></View>
          <Text accessibilityRole="header" style={[s.title, { color: correct ? "#18734F" : "#A34530", textAlign: "center", fontSize: 41 }]}>
            {correct ? "¡Correcto!" : selected === null ? "Se terminó el tiempo" : "Respuesta incorrecta"}
          </Text>
          <Text style={s.resultText}>La respuesta correcta era{"\n"}“{round.question.correct}”</Text>
          <Text style={[s.resultText, correct && { color: "#18734F" }]}>{result.spaces === 0 ? "No avanzás" : `Avanzá ${result.spaces} ${result.spaces === 1 ? "casillero" : "casilleros"}`}</Text>
          {result.reward && <Text style={s.resultText}>Recibís {advantageLabel(result.reward)} por contestar rápido</Text>}
        </View>
        <Text style={s.resultText}>Dato curioso: {round.question.fact}</Text>
        <View style={{ flex: 1, minHeight: 30 }} />
        <Button label="Siguiente" onPress={next} primary />
      </>}
    </ScrollView></Enter>
    {inRound && <Pressable accessibilityRole="button" accessibilityLabel="Abrir ventajas del juego" onPress={() => setShowAdvantages(true)} style={s.dice}>
      <MenuArt name="game" size={65} />
    </Pressable>}
    <Modal visible={showAdvantages} transparent animationType="slide" onRequestClose={() => setShowAdvantages(false)}>
      <View style={s.overlay}>
        <Pressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel="Cerrar ventajas" onPress={() => setShowAdvantages(false)} />
        <ScrollView style={s.sheet} contentContainerStyle={{ padding: 22, gap: 12 }}>
          <Text accessibilityRole="header" style={s.title}>Ventajas</Text>
          {used && <Text style={s.body}>Ya usaste una ventaja en esta pregunta.</Text>}
          {(["Pista", "Tiempo extra", "50/50"] as const).map(kind => {
            const index = advantages.findIndex(item => item.kind === kind);
            const advantage = advantages[index];
            return <Button key={kind} label={advantage ? advantageLabel(advantage) : kind + " · No disponible"}
              disabled={!advantage || !!used || page !== "question"}
              onPress={() => { if (advantage) useAdvantage(advantage, index); }} />;
          })}
          <Button label="Volver al inicio" onPress={() => { setShowAdvantages(false); leaveGame(); }} />
          <Button label="Cerrar" onPress={() => setShowAdvantages(false)} />
        </ScrollView>
      </View>
    </Modal>
  </View>;
}

function Button({ label, onPress, primary, disabled, optionLetter, color = petrol }: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  color?: string;
  optionLetter?: string;
}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={[s.button, optionLetter && s.option, disabled && !primary && !optionLetter && { opacity: 0.55 }, { borderColor: color, backgroundColor: primary ? color : cream }]}>
    {optionLetter && <View style={[s.letter, { backgroundColor: color }]}><Text style={s.letterText}>{optionLetter}</Text></View>}
    <Text style={[s.buttonText, optionLetter && { flex: 1, paddingRight: 44 }, { color: primary ? cream : color }]}>{label}</Text>
  </Pressable>;
}

function Badge({ text, color }: { text: string; color: string }) {
  return <Text style={[s.badge, { color, borderColor: color }]}>{text}</Text>;
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  dice: { position: "absolute", bottom: 18, alignSelf: "center" },
  overlay: { flex: 1, backgroundColor: "#0005", justifyContent: "flex-end" },
  sheet: { flexGrow: 0, maxHeight: "75%", width: "100%", maxWidth: 600, alignSelf: "center", backgroundColor: cream, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  rulesBody: { color: petrol, fontSize: 17, lineHeight: 24 },
  bar: { backgroundColor: "transparent", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  back: { minHeight: 48, minWidth: 76, justifyContent: "center" },
  barText: { color: petrol, fontSize: 20, fontWeight: "800" },
  rulesTitle: { fontSize: 38, color: petrol, fontWeight: "800", textAlign: "center", marginTop: 38, marginBottom: 12 },
  rulesBlock: { paddingHorizontal: 18, gap: 9 },
  intro: { flexDirection: "row", gap: 14, alignItems: "center", alignSelf: "stretch" },
  introText: { flex: 1 },
  people: { width: 58, fontSize: 24, textAlign: "center", color: "#F2A625" },
  feedback: { color: petrol, textAlign: "center", fontWeight: "700" },
  resultText: { color: "#171717", textAlign: "center", fontSize: 17, lineHeight: 23 },
  option: { flexDirection: "row", alignItems: "center", paddingVertical: 0, paddingHorizontal: 0, overflow: "hidden" },
  letter: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  letterText: { color: cream, fontSize: 21, fontWeight: "800" },
  buttonText: { textAlign: "center", fontSize: 20, fontWeight: "800" },
  content: { padding: 20, paddingBottom: 112, gap: 14, width: "100%", maxWidth: 600, alignSelf: "center" },
  hero: { alignItems: "center", gap: 12, paddingVertical: 14 },
  title: { color: petrol, fontSize: 29, fontWeight: "900" },
  heading: { color: petrol, fontSize: 19, fontWeight: "800" },
  body: { color: "#26363C", fontSize: 16, lineHeight: 23 },
  label: { color: petrol, fontSize: 16, fontWeight: "800" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  button: { minHeight: 46, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderRadius: 22, justifyContent: "center", marginHorizontal: 9 },
  categories: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, borderTopWidth: 2, borderTopColor: petrol, paddingTop: 12 },
  status: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  badge: { borderWidth: 2, borderRadius: 24, minWidth: 125, textAlign: "center", paddingVertical: 10, paddingHorizontal: 12, fontWeight: "800" },
  advantageArea: { gap: 10, alignItems: "stretch" },
  advantageButton: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 8, minHeight: 48 },
});

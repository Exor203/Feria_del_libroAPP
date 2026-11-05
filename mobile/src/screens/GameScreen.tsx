import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GameIcon from "../components/GameIcon";
import { readerQuestions } from "../data/readerQuestions";
import { advantageLabel, categories, fiftyFifty, pickQuestion, roundMs, scoreAnswer, type Advantage } from "../services/readerGame";

const accent = { Autores: "#684A83", Géneros: "#18734F", Editoriales: "#A34530", Feria: "#235C99" };
const petrol = "#0C4358";
const cream = "#FFF6E5";

export default function GameScreen({ onExit }: { onExit: () => void }) {
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

  const back = useCallback(() => {
    if (page === "start") onExit();
    else if (showAdvantages) setShowAdvantages(false);
    else {
      locked.current = true;
      setRound(null);
      seen.current.clear();
      setAdvantages([]);
      setPage("start");
    }
  }, [onExit, page, showAdvantages]);

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

  const correct = Boolean(result?.spaces);
  return <View style={s.screen}>
    <View style={s.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={back} hitSlop={8} style={s.back}>
        <Text style={s.barText}>‹ Volver</Text>
      </Pressable>
      <Text style={s.barText}>JUEGO</Text>
      <View style={s.spacer} />
    </View>
    <ScrollView key={page === "feedback" ? "question" : page} contentContainerStyle={s.content}>
      {page === "start" && <>
        <View style={s.hero}>
          <GameIcon trophy size={72} />
          <Text accessibilityRole="header" style={s.title}>La Ruta del Lector</Text>
          <Text style={s.body}>Respondé preguntas literarias en la app y avanzá tu ficha en el tablero físico.</Text>
          <Text style={s.label}>2 a 4 jugadores</Text>
        </View>
        <Button label="Jugar" onPress={next} primary />
        <Button label="¿Cómo se juega?" onPress={() => setPage("rules")} />
        <View style={s.categories}>{categories.map(category => <Badge key={category} text={category} color={accent[category]} />)}</View>
      </>}
      {page === "rules" && <>
        <Text accessibilityRole="header" style={s.title}>¿Cómo se juega?</Text>
        <View style={s.card}>
          <Text style={s.heading}>Reglas</Text>
          <Text style={s.body}>Cada jugador pone su ficha en el punto de inicio. En tu turno, tenés 30 segundos para responder una pregunta aleatoria.</Text>
          <Text style={s.body}>• Hasta 10 s: avanzá 3 casilleros.{"\n"}• Más de 10 y hasta 20 s: avanzá 2.{"\n"}• Más de 20 s: avanzá 1 si acertás a tiempo.{"\n"}• Si errás o se acaba el tiempo: 0 casilleros.</Text>
          <Text style={s.body}>Pasale el teléfono a quien sigue y tocá Siguiente cuando esté listo. El reloj arranca enseguida.</Text>
          <Text style={s.body}>Las insignias se consiguen en sectores del tablero físico. Reuní 4 de géneros distintos y volvé al centro para el desafío final.</Text>
        </View>
        <View style={s.card}>
          <Text style={s.heading}>Ventajas</Text>
          <Text style={s.body}>Si acertás en hasta 10 s, ganás una ventaja. Si acertás después de 10 s y hasta los 20 s, tenés un 50 % de probabilidad de ganar una. Se guardan para los próximos turnos en el teléfono y podés usar una por pregunta. Al ganar, las probabilidades son 40 % Pista, 40 % Tiempo extra y 20 % 50/50.</Text>
          <Text style={s.body}>Pista · Muestra una ayuda sobre la pregunta.{"\n"}Tiempo extra · Suma 10 s si la ganaste en el primer tramo o 5 s si fue en el segundo.{"\n"}50/50 · Elimina dos opciones incorrectas.</Text>
        </View>
        <Button label="Jugar" onPress={next} primary />
      </>}
      {round && (page === "question" || page === "feedback") && <>
        <View style={s.status}>
          <Badge text={round.question.category} color={accent[round.question.category]} />
          <Badge text={`00:${String(remaining).padStart(2, "0")}`} color={remaining <= 5 ? "#A34530" : petrol} />
        </View>
        <Text accessibilityRole="header" style={s.title}>{round.question.prompt}</Text>
        {used?.kind === "Pista" && <View style={s.card}><Text style={s.body}>Pista · {round.question.hint}</Text></View>}
        {round.options.map((option, index) => !hidden.includes(option) &&
          <Button key={option} label={`${"ABCD"[index]} · ${option}`}
            primary={option === selected} color={option === selected ? (correct ? "#18734F" : "#A34530") : petrol}
            disabled={page === "feedback"} onPress={() => finish(option, Date.now())} />
        )}
        {page === "feedback" && <Text accessibilityLiveRegion="polite" style={s.label}>{correct ? "¡Correcto!" : "Respuesta incorrecta"}</Text>}
        {page === "question" && <View style={s.advantageArea}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showAdvantages }}
            onPress={() => setShowAdvantages(value => !value)} style={s.advantageButton}>
            <GameIcon size={42} /><Text style={s.label}>Ventajas ({advantages.length})</Text>
          </Pressable>
          {showAdvantages && <View style={s.card}>
            {used ? <Text style={s.body}>Ya usaste una ventaja en esta pregunta.</Text> :
              advantages.length === 0 ? <Text style={s.body}>Todavía no hay ventajas disponibles.</Text> :
              advantages.map((advantage, index) => <Button key={index} label={advantageLabel(advantage)} onPress={() => useAdvantage(advantage, index)} />)}
          </View>}
        </View>}
      </>}
      {round && page === "result" && result && <>
        <View style={s.hero}>
          <Text accessibilityRole="header" style={[s.title, { color: correct ? "#18734F" : "#A34530" }]}>
            {correct ? "¡Correcto!" : selected === null ? "Se terminó el tiempo" : "Respuesta incorrecta"}
          </Text>
          <Text style={s.body}>Respuesta correcta · {round.question.correct}</Text>
          <Text style={s.heading}>{result.spaces === 0 ? "No avanzás" : `Avanzá ${result.spaces} ${result.spaces === 1 ? "casillero" : "casilleros"}`}</Text>
          {result.reward && <Badge text={`Ganaste ${advantageLabel(result.reward)}`} color="#18734F" />}
        </View>
        <View style={s.card}><Text style={s.heading}>Dato curioso</Text><Text style={s.body}>{round.question.fact}</Text></View>
        <Text style={s.body}>Pasale el teléfono a quien sigue antes de tocar Siguiente.</Text>
        <Button label="Siguiente" onPress={next} primary />
      </>}
    </ScrollView>
  </View>;
}

function Button({ label, onPress, primary, disabled, color = petrol }: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  color?: string;
}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={[s.button, { borderColor: color, backgroundColor: primary ? color : cream }]}>
    <Text style={[s.label, { color: primary ? cream : color }]}>{label}</Text>
  </Pressable>;
}

function Badge({ text, color }: { text: string; color: string }) {
  return <Text style={[s.badge, { color, borderColor: color }]}>{text}</Text>;
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  bar: { backgroundColor: petrol, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  back: { minHeight: 48, minWidth: 76, justifyContent: "center" },
  barText: { color: "#F4A62A", fontWeight: "800" },
  spacer: { width: 76 },
  content: { padding: 20, paddingBottom: 112, gap: 14, width: "100%", maxWidth: 600, alignSelf: "center" },
  hero: { alignItems: "center", gap: 12, paddingVertical: 14 },
  title: { color: petrol, fontSize: 29, fontWeight: "900" },
  heading: { color: petrol, fontSize: 19, fontWeight: "800" },
  body: { color: "#26363C", fontSize: 16, lineHeight: 23 },
  label: { color: petrol, fontSize: 16, fontWeight: "800" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, gap: 10 },
  button: { minHeight: 46, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 2, borderRadius: 22, justifyContent: "center" },
  categories: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  status: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  badge: { borderWidth: 1, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 12, fontWeight: "800" },
  advantageArea: { gap: 10, alignItems: "stretch" },
  advantageButton: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 8, minHeight: 48 },
});

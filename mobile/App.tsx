import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Enter, FairBackdrop, Heading } from "./src/components/FairUi";
import { ProfileScreen, ScannerScreen } from "./src/screens/LibraryScreens";
import { TradingScreen } from "./src/screens/TradingScreen";
import { useLibrary } from "./src/services/library";
import { ArtistsPreview, EventsPreview, MapPreview } from "./src/screens/FairSections";
import { ActivityIndicator, Alert, Platform, Pressable, SafeAreaView, StatusBar as NativeStatusBar, StyleSheet, Text, View } from "react-native";
import BooksScreen from "./src/screens/BooksScreen";
import GameScreen from "./src/screens/GameScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AssistantScreen from "./src/screens/AssistantScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { watchAccount, logoutAccount, accountSession, type AccountSession } from "./src/services/authService";
import { authErrorMessage } from "./src/services/authErrors";
import SectionMenu, { type MenuDestination } from "./src/components/SectionMenu";
import { MenuArt } from "./src/components/MenuArt";

type Screen = "home" | "menu" | "books" | "events" | "map" | "artists" | "exchange" | "assistant" | "camera" | "game" | "profile";

const libraryError = () => Alert.alert("No se pudo acceder a tu biblioteca", "Volvé a abrir la app e intentá nuevamente.");

export default function App() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const library = useLibrary(session?.uid ?? "", libraryError);
  const [authReady, setAuthReady] = useState(false);
  const [authProblem, setAuthProblem] = useState<string | null>(null);
  const [authAttempt, setAuthAttempt] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    setAuthReady(false); setAuthProblem(null);
    try {
      return watchAccount(user => { setSession(user ? accountSession(user) : null); setAuthReady(true); }, problem => { setAuthProblem(authErrorMessage(problem)); setAuthReady(true); });
    } catch (problem) { setAuthProblem(authErrorMessage(problem)); setAuthReady(true); }
  }, [authAttempt]);
  const [screen, setScreen] = useState<Screen>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [gameRound, setGameRound] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const openScreen = (next: Screen) => { setScreen(next); setMenuOpen(false); };
  const selectSection = (next: MenuDestination) => { if (next === "books") setSelectedBookId(null); openScreen(next); };
  const signOut = async () => {
    if (leaving) return;
    setLeaving(true);
    try { await logoutAccount(); setSession(null); setScreen("home"); setMenuOpen(false); setSelectedBookId(null); }
    catch (problem) { Alert.alert("No pudimos cerrar la sesión", authErrorMessage(problem)); }
    finally { setLeaving(false); }
  };
  if (!authReady || authProblem) return <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center", padding: 24 }]}><StatusBar style="dark" />{authProblem ? <><Text style={styles.description}>{authProblem}</Text><Pressable accessibilityRole="button" onPress={() => setAuthAttempt(value => value + 1)} style={{ padding: 20 }}><Text style={styles.backLink}>Reintentar</Text></Pressable></> : <><ActivityIndicator color="#0C4358" /><Text style={styles.description}>Cargando tu sesión…</Text></>}</SafeAreaView>;
  if (!session) return <SafeAreaView style={[styles.safeArea, Platform.OS === "android" && { paddingTop: NativeStatusBar.currentHeight ?? 0, paddingBottom: 12 }]}><StatusBar style="dark" /><FairBackdrop section="login" /><Enter change="login"><LoginScreen onAuthenticated={user => setSession(accountSession(user))} /></Enter></SafeAreaView>;
  return <SafeAreaView style={[styles.safeArea, Platform.OS === "android" && { paddingTop: NativeStatusBar.currentHeight ?? 0, paddingBottom: 12 }]} >
    <StatusBar style="dark" />
    <FairBackdrop section={screen} />
    <Enter change={screen}>
    {screen !== "home" && screen !== "game" && screen !== "exchange" && <TopBar onBack={() => screen === "books" && selectedBookId ? setSelectedBookId(null) : openScreen("home")} />}
    {screen === "home" && <HomeScreen onBooks={() => selectSection("books")} onBook={(id) => { setSelectedBookId(id); openScreen("books"); }} onArtists={() => openScreen("artists")} />}
    {screen === "books" && <BooksScreen onSave={library.ready ? library.save : undefined} selectedBookId={selectedBookId} onSelect={setSelectedBookId} onCloseDetail={() => setSelectedBookId(null)} onExchange={() => openScreen("exchange")} />}
    {screen === "events" && <EventsPreview initialTab="agenda" />}
    {screen === "map" && <MapPreview />}{screen === "artists" && <ArtistsPreview />}{screen === "exchange" && <TradingScreen books={library.books} trades={library.trades} ready={library.ready} onSend={library.addTrade} onExit={() => openScreen("home")} />}{screen === "assistant" && <><View style={{ paddingHorizontal: 18, paddingBottom: 10 }}><Heading title="Asistente IA" subtitle="Tu guía durante la Feria del Libro" /></View><AssistantScreen onBooks={() => selectSection("books")} onEvents={() => openScreen("events")} /></>}
    {screen === "game" && <GameScreen onRoundMode={setGameRound} onExit={() => openScreen("home")} />}
    {screen === "camera" && <ScannerScreen active={!menuOpen} ready={library.ready} onSave={book => { library.save(book); openScreen("profile"); }} />}
    {screen === "profile" && <ProfileScreen name={session.displayName || session.email || "Lector"} books={library.books} trades={library.trades} onCamera={() => openScreen("camera")} onTrading={() => openScreen("exchange")} signingOut={leaving} onSignOut={() => void signOut()} />}
    </Enter>
    {(screen !== "game" || !gameRound) && <Pressable style={[styles.bookButton, { width: 76, height: 76, marginLeft: -38, borderWidth: 0, backgroundColor: "transparent" }]} onPress={() => setMenuOpen(true)} accessibilityRole="button" accessibilityLabel="Abrir menú de secciones" accessibilityState={{ expanded: menuOpen }}><MenuArt name="bookClosed" size={65} /></Pressable>}
    <SectionMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onSelect={selectSection} />
  </SafeAreaView>;
}

function TopBar({ onBack }: { onBack: () => void }) { return <View style={styles.topBar}><Pressable accessibilityRole="button" onPress={onBack} hitSlop={10}><Text style={styles.back}>‹ Volver</Text></Pressable></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF6E5" },
  topBar: { alignItems: "center", backgroundColor: "transparent", flexDirection: "row", paddingHorizontal: 18, minHeight: 52 },
  back: { color: "#064057", fontSize: 23, fontWeight: "700" },
  description: { color: "#26363C", fontSize: 16, lineHeight: 23 },
  backLink: { color: "#0C4358", fontWeight: "900" },
  bookButton: { alignItems: "center", backgroundColor: "#00756F", borderColor: "#FFF6E5", borderRadius: 34, borderWidth: 4, bottom: 18, height: 68, justifyContent: "center", left: "50%", marginLeft: -34, position: "absolute", width: 68 },
});

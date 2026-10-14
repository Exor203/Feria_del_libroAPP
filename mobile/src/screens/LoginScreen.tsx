import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { validateAuthForm, type AuthMode } from "../services/authValidation";

import { FeriaLogo, SocialLogo } from "../components/AuthLogos";

import { authConfigured, loginAccount, registerAccount, resetAccountPassword, type AccountUser } from "../services/authService";
import { authErrorMessage } from "../services/authErrors";
type Props = { onAuthenticated: (user: AccountUser) => void };
export default function LoginScreen({ onAuthenticated }: Props) {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<"welcome" | AuthMode>("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  const changeMode = (next: "welcome" | AuthMode) => { if (busyRef.current) return; setMode(next); setNotice(null); setError(null); setPassword(""); setConfirmation(""); setVisiblePassword(false); };
  useEffect(() => {
    if (mode === "welcome") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { changeMode("welcome"); return true; });
    return () => subscription.remove();
  }, [mode]);
  const submit = async () => {
    if (mode === "welcome" || busyRef.current) return;
    const message = validateAuthForm(mode, { name, email, password, confirmation });
    setError(message); setNotice(null);
    if (message) return;
    busyRef.current = true; setBusy(true);
    try {
      const user = mode === "register" ? await registerAccount(name, email, password) : await loginAccount(email, password);
      setPassword(""); setConfirmation(""); onAuthenticated(user);
    } catch (problem) { setError(authErrorMessage(problem)); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const recover = async () => {
    if (busyRef.current) return;
    const emailError = validateAuthForm("login", { name: "", email, password: "valid12", confirmation: "" });
    if (emailError) { setError(emailError); return; }
    busyRef.current = true; setBusy(true); setError(null); setNotice(null);
    try { await resetAccountPassword(email); setNotice("Si existe una cuenta con ese correo, recibirás instrucciones para recuperar tu contraseña. Revisá también spam."); }
    catch (problem) { setError(authErrorMessage(problem)); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const social = (provider: string) => Alert.alert(`Ingresar con ${provider}`, "Este acceso todavía no está conectado en la app. Podés crear una cuenta o iniciar sesión con correo y contraseña.");
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content, { minHeight: Math.max(500, height - 60) }]}>
      {mode === "welcome" ? <>
        <View style={s.logo}><FeriaLogo width={Math.min(width - 72, 320)} /></View>
        <Text accessibilityRole="header" style={s.welcome}>BIENVENIDOS</Text>
        <View style={s.buttons}>
          <Pressable accessibilityRole="button" onPress={() => changeMode("register")} style={s.primary}><Text style={s.primaryText}>Crear cuenta</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => changeMode("login")} style={s.primary}><Text style={s.primaryText}>Iniciar sesión</Text></Pressable>
        </View>
        <View style={s.divider}><View style={s.line} /><Text style={s.or}>O</Text><View style={s.line} /></View>
        <View style={s.socialRow}>{(["Google", "Facebook", "Apple"] as const).map((provider) => <Pressable key={provider} accessibilityRole="button" accessibilityLabel={`Ingresar con ${provider}, próximamente`} onPress={() => social(provider)} style={s.social}>
          <SocialLogo provider={provider} />
        </Pressable>)}</View>
        <Text style={s.note}>Creá tu cuenta para participar de la comunidad de la feria.</Text>
      </> : <>
        <Pressable accessibilityRole="button" onPress={() => changeMode("welcome")} style={s.back}><Text style={s.link}>‹ Volver</Text></Pressable>
        <View style={s.formLogo}><FeriaLogo width={132} /></View>
        <Text accessibilityRole="header" style={s.welcome}>{mode === "register" ? "CREAR CUENTA" : "INICIAR SESIÓN"}</Text>
        <Text style={s.demoNotice}>{mode === "register" ? "Usá un correo al que tengas acceso. Tu cuenta se crea en Firebase." : "Ingresá con el correo y la contraseña de tu cuenta."}</Text>
        {mode === "register" && <View style={s.field}><Text style={s.label}>Nombre</Text><TextInput accessibilityLabel="Nombre" editable={!busy} value={name} onChangeText={setName} style={s.input} autoComplete="name" placeholder="Tu nombre" placeholderTextColor="#657173" /></View>}
        <View style={s.field}><Text style={s.label}>Correo electrónico</Text><TextInput accessibilityLabel="Correo electrónico" editable={!busy} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" style={s.input} placeholder="nombre@ejemplo.com" placeholderTextColor="#657173" /></View>
        <View style={s.field}><Text style={s.label}>Contraseña</Text><View style={s.passwordRow}><TextInput accessibilityLabel="Contraseña" editable={!busy} value={password} onChangeText={setPassword} secureTextEntry={!visiblePassword} autoCapitalize="none" autoCorrect={false} autoComplete="off" style={s.passwordInput} placeholder="Al menos 6 caracteres" placeholderTextColor="#657173" /><Pressable accessibilityRole="button" accessibilityLabel={visiblePassword ? "Ocultar contraseña" : "Mostrar contraseña"} onPress={() => setVisiblePassword(value => !value)} style={s.showPassword}><Text style={s.link}>{visiblePassword ? "Ocultar" : "Ver"}</Text></Pressable></View></View>
        {mode === "register" && <View style={s.field}><Text style={s.label}>Repetir contraseña</Text><TextInput accessibilityLabel="Repetir contraseña" editable={!busy} value={confirmation} onChangeText={setConfirmation} secureTextEntry={!visiblePassword} autoCapitalize="none" autoCorrect={false} autoComplete="off" style={s.input} /></View>}
        {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
        {notice && <Text accessibilityLiveRegion="polite" style={s.note}>{notice}</Text>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy || !authConfigured, busy }} disabled={busy || !authConfigured} onPress={() => void submit()} style={[s.primary, (busy || !authConfigured) && { opacity: 0.6 }]}>{busy ? <ActivityIndicator color="white" /> : <Text style={s.submitText}>{mode === "register" ? "Crear cuenta" : "Iniciar sesión"}</Text>}</Pressable>
        {!authConfigured && <Text style={s.error}>Falta completar la configuración de acceso de la app.</Text>}
        {mode === "login" && <Pressable accessibilityRole="button" disabled={busy || !authConfigured} onPress={() => void recover()} style={s.switch}><Text style={s.link}>Olvidé mi contraseña</Text></Pressable>}
        <Pressable accessibilityRole="button" onPress={() => changeMode(mode === "login" ? "register" : "login")} style={s.switch}><Text style={s.link}>{mode === "login" ? "¿No tenés cuenta? Crear cuenta" : "¿Ya tenés cuenta? Iniciar sesión"}</Text></Pressable>
      </>}
    </ScrollView>
  </KeyboardAvoidingView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF6E5" }, content: { paddingHorizontal: 30, paddingTop: 30, paddingBottom: 30, width: "100%", maxWidth: 480, alignSelf: "center", justifyContent: "center" },
  logo: { alignItems: "center", marginBottom: 48 }, formLogo: { alignItems: "center", marginBottom: 22 }, welcome: { color: "#0C4358", fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 30 },
  buttons: { gap: 12 }, primary: { backgroundColor: "#0C4358", borderRadius: 32, minHeight: 56, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 }, primaryText: { color: "white", fontSize: 25 }, submitText: { color: "white", fontSize: 19, fontWeight: "600" },
  divider: { flexDirection: "row", gap: 24, alignItems: "center", justifyContent: "center", marginTop: 26, marginBottom: 24 }, line: { height: 1.5, flex: 1, backgroundColor: "#0C4358", maxWidth: 92 }, or: { color: "#0C4358", fontSize: 24, fontWeight: "700" },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 14 }, social: { backgroundColor: "#0C4358", borderRadius: 30, width: 72, height: 50, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  note: { color: "#657173", fontSize: 12, textAlign: "center", marginTop: 22, lineHeight: 18 }, demoNotice: { color: "#0C4358", backgroundColor: "#F7E9CB", borderRadius: 12, padding: 12, lineHeight: 20, marginBottom: 20 },
  field: { gap: 6, marginBottom: 16 }, label: { color: "#0C4358", fontSize: 15, fontWeight: "600" }, input: { borderWidth: 1.5, borderColor: "#0C4358", borderRadius: 12, color: "#20201D", backgroundColor: "white", fontSize: 16, minHeight: 50, paddingHorizontal: 14, paddingVertical: 10 },
  passwordRow: { borderWidth: 1.5, borderColor: "#0C4358", borderRadius: 12, backgroundColor: "white", flexDirection: "row", alignItems: "center" }, passwordInput: { color: "#20201D", fontSize: 16, flex: 1, minHeight: 50, paddingHorizontal: 14, paddingVertical: 10 }, showPassword: { paddingHorizontal: 12, minHeight: 48, justifyContent: "center" },
  back: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", marginBottom: 10 }, link: { color: "#0C4358", fontSize: 15, fontWeight: "700" }, switch: { alignItems: "center", justifyContent: "center", minHeight: 48, marginTop: 12 }, error: { color: "#A52720", lineHeight: 20, marginBottom: 16 },
});

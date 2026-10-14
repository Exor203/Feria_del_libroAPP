import { assistantInstructions, conversationHistory, validateMessage, type ChatTurn } from "./assistantPolicy";

// Firebase client configuration is public. Gemini/admin credentials must never be put here.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
const modelName = process.env.EXPO_PUBLIC_GEMINI_MODEL;
const localMode = process.env.EXPO_PUBLIC_ASSISTANT_MODE === "local";
const localUrl = process.env.EXPO_PUBLIC_ASSISTANT_URL;
const localToken = process.env.EXPO_PUBLIC_LOCAL_CHAT_TOKEN;
export const assistantConfigured = localMode ? Boolean(localUrl && localToken) : Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && modelName);

let inFlight = false;
let lastRequest = 0;
let windowStarted = 0;
let requestsInWindow = 0;

export async function askAssistant(message: string, turns: ChatTurn[]): Promise<string> {
  const validation = validateMessage(message);
  if (validation) throw new Error(validation);
  if (!assistantConfigured) throw new Error("El asistente todavía no está conectado a Firebase AI Logic.");
  if (inFlight) throw new Error("Esperá la respuesta antes de enviar otra consulta.");
  const now = Date.now();
  if (now - lastRequest < 3000) throw new Error("Esperá unos segundos antes de enviar otra consulta.");
  if (now - windowStarted >= 3600000) { windowStarted = now; requestsInWindow = 0; }
  if (requestsInWindow >= 20) throw new Error("Se alcanzó el límite local de 20 consultas por hora para esta prueba.");
  inFlight = true;
  lastRequest = now;
  requestsInWindow++;
  try {
    if (localMode) {
      if (!__DEV__) throw new Error("El servidor local solo se permite en la versión de prueba.");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 50000);
      try {
        const response = await fetch(`${localUrl!.replace(/\/$/, "")}/chat`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localToken}` }, signal: controller.signal,
          body: JSON.stringify({ message: message.trim(), history: conversationHistory(turns) }),
        });
        const result = await response.json();
        if (!response.ok) throw Object.assign(new Error(typeof result.error === "string" ? result.error : "No se pudo consultar la IA."), { code: "assistant/local-error" });
        if (typeof result.text !== "string" || !result.text.trim()) throw new Error("No text response");
        return result.text.trim();
      } catch (problem) {
        if (controller.signal.aborted) throw new Error("timeout");
        throw problem;
      } finally { clearTimeout(timeout); }
    }
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getAI, getGenerativeModel, GoogleAIBackend } = await import("firebase/ai");
    const app = getApps().some(item => item.name === "feria-assistant") ? getApp("feria-assistant") : initializeApp(firebaseConfig, "feria-assistant");
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, {
      model: modelName!,
      systemInstruction: assistantInstructions(),
      generationConfig: { maxOutputTokens: 1024, temperature: 0.3 },
    }, { timeout: 20000 });
    const chat = model.startChat({ history: conversationHistory(turns).map(turn => ({ role: turn.role, parts: [{ text: turn.text }] })) });
    const result = await chat.sendMessage(message.trim());
    const text = result.response.text().trim();
    if (!text) throw new Error("No text response");
    return text;
  } finally { inFlight = false; }
}

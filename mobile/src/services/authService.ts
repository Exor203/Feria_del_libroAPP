import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
};
export const authConfigured = Boolean(config.apiKey && config.projectId && config.appId);
let auth: FirebaseAuth.Auth | undefined;

export function getAccountAuth(): FirebaseAuth.Auth {
  if (!authConfigured) throw new Error("Falta configurar Firebase Authentication.");
  if (auth) return auth;
  const app = getApps().some(item => item.name === "feria-account") ? getApp("feria-account") : initializeApp(config, "feria-account");
  try {
    // Firebase exposes this function in its React Native entry point; browser types omit it.
    const nativeSdk = FirebaseAuth as typeof FirebaseAuth & { getReactNativePersistence: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence };
    auth = FirebaseAuth.initializeAuth(app, { persistence: Platform.OS === "web" ? FirebaseAuth.browserLocalPersistence : nativeSdk.getReactNativePersistence(AsyncStorage) });
    auth.languageCode = "es";
  } catch (problem) {
    if (problem && typeof problem === "object" && "code" in problem && problem.code === "auth/already-initialized") auth = FirebaseAuth.getAuth(app);
    else throw problem;
  }
  return auth;
}

export async function registerAccount(name: string, email: string, password: string): Promise<FirebaseAuth.User> {
  const result = await FirebaseAuth.createUserWithEmailAndPassword(getAccountAuth(), email.trim(), password);
  try { await FirebaseAuth.updateProfile(result.user, { displayName: name.trim() }); }
  catch { /* Account creation succeeded; a failed name update must not prompt another registration. */ }
  return result.user;
}
export async function loginAccount(email: string, password: string): Promise<FirebaseAuth.User> {
  return (await FirebaseAuth.signInWithEmailAndPassword(getAccountAuth(), email.trim(), password)).user;
}
export function logoutAccount() { return FirebaseAuth.signOut(getAccountAuth()); }
export function resetAccountPassword(email: string) { return FirebaseAuth.sendPasswordResetEmail(getAccountAuth(), email.trim()); }
export function watchAccount(next: (user: FirebaseAuth.User | null) => void, failed: (error: unknown) => void) { return FirebaseAuth.onAuthStateChanged(getAccountAuth(), next, failed); }
export type AccountUser = FirebaseAuth.User;
export type AccountSession = Pick<AccountUser, "uid" | "displayName" | "email" | "emailVerified">;
export function accountSession(user: AccountUser): AccountSession { return { uid: user.uid, displayName: user.displayName, email: user.email, emailVerified: user.emailVerified }; }

export function authErrorMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  switch (code) {
    case "auth/email-already-in-use": return "Ese correo ya tiene una cuenta. Iniciá sesión o recuperá tu contraseña.";
    case "auth/invalid-email": return "Ingresá un correo electrónico válido.";
    case "auth/weak-password": case "auth/password-does-not-meet-requirements": return "La contraseña no cumple los requisitos. Probá una más larga con mayúsculas, minúsculas y números.";
    case "auth/invalid-credential": case "auth/wrong-password": case "auth/user-not-found": return "El correo o la contraseña no son correctos.";
    case "auth/network-request-failed": return "No pudimos conectarnos. Revisá internet y volvé a intentar.";
    case "auth/too-many-requests": return "Se realizaron demasiados intentos. Esperá un momento y probá de nuevo.";
    case "auth/operation-not-allowed": return "El acceso con correo y contraseña todavía no está habilitado en Firebase.";
    case "auth/user-disabled": return "Esta cuenta está deshabilitada. Contactá a la organización.";
    default: return "No pudimos completar la operación. Volvé a intentar.";
  }
}

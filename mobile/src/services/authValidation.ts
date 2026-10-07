export type AuthMode = "login" | "register";
export type AuthFields = { name: string; email: string; password: string; confirmation: string };
export function validateAuthForm(mode: AuthMode, fields: AuthFields): string | null {
  if (mode === "register" && fields.name.trim().length < 2) return "Ingresá tu nombre (al menos 2 caracteres).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) return "Ingresá un correo electrónico válido.";
  if (fields.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  if (mode === "register" && fields.password !== fields.confirmation) return "Las contraseñas no coinciden.";
  return null;
}

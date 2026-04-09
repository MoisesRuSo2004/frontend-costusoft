// Nombres de las cookies de sesión
const TOKEN_KEY = "cs_token";
const REFRESH_KEY = "cs_refresh";
const ROLE_KEY = "cs_role";

/**
 * Guarda los tokens y el rol en cookies del navegador.
 * El middleware de Next.js puede leer estas cookies para proteger rutas.
 */
export function setAuthCookies(params: {
  accessToken: string;
  refreshToken: string;
  rol: string;
  expiresIn: number; // milisegundos
}) {
  const accessExpires = new Date(Date.now() + params.expiresIn);
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
  const secure = location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(params.accessToken)}; expires=${accessExpires.toUTCString()}; path=/; SameSite=Strict${secure}`;
  document.cookie = `${REFRESH_KEY}=${encodeURIComponent(params.refreshToken)}; expires=${refreshExpires.toUTCString()}; path=/; SameSite=Strict${secure}`;
  document.cookie = `${ROLE_KEY}=${params.rol}; expires=${accessExpires.toUTCString()}; path=/; SameSite=Strict${secure}`;
}

/** Elimina todas las cookies de sesión (logout). */
export function clearAuthCookies() {
  const past = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = `${TOKEN_KEY}=; ${past}`;
  document.cookie = `${REFRESH_KEY}=; ${past}`;
  document.cookie = `${ROLE_KEY}=; ${past}`;
}

/** Lee el access token desde las cookies del navegador. */
export function getTokenFromCookie(): string | null {
  return readCookie(TOKEN_KEY);
}

/** Lee el refresh token desde las cookies del navegador. */
export function getRefreshTokenFromCookie(): string | null {
  return readCookie(REFRESH_KEY);
}

/** Lee el rol del usuario desde las cookies del navegador. */
export function getRoleFromCookie(): string | null {
  return readCookie(ROLE_KEY);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

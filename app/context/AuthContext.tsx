"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { UsuarioInfo, UserRole } from "@/app/types/auth";
import { authService } from "@/app/services/auth.service";
import {
  clearAuthCookies,
  getTokenFromCookie,
  setAuthCookies,
} from "@/app/lib/cookies";

// Dashboard por rol
const ROLE_DASHBOARD: Record<UserRole, string> = {
  ADMIN: "/admin",
  USER: "/user",
  BODEGA: "/bodega",
};

interface AuthContextValue {
  user: UsuarioInfo | null;
  isAuthenticated: boolean;
  /** true mientras se verifica la sesión al cargar la app */
  isLoading: boolean;
  /** Inicia sesión, guarda cookies y redirige al dashboard del rol */
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  /** Cierra sesión, limpia cookies y redirige a /login */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Al montar, intentar restaurar la sesión con /me
  useEffect(() => {
    const token = getTokenFromCookie();

    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then((usuario) => setUser(usuario))
      .catch(() => {
        // Token inválido o expirado → limpiar sesión
        clearAuthCookies();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (username: string, password: string, rememberMe = false) => {
      const data = await authService.login({ username, password });

      // Si "recuérdame" está activo extendemos la cookie al tiempo del refresh token (7 días)
      const expiresIn = rememberMe ? 7 * 24 * 60 * 60 * 1000 : data.expiresIn;

      setAuthCookies({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        rol: data.usuario.rol,
        expiresIn,
      });

      setUser(data.usuario);

      router.push(ROLE_DASHBOARD[data.usuario.rol]);
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAuthCookies();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook para consumir el contexto de autenticación en cualquier componente cliente. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

import { useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";

// Configuración de tiempos
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inactividad
const WARNING_BEFORE_LOGOUT = 5 * 60 * 1000; // Advertencia 5 minutos antes

export function useSessionTimeout(onSessionExpired?: () => void) {
  const { isAuthenticated, logout } = useAuth();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetInactivityTimer = () => {
      // Limpiar timers previos
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

      // Timer para advertencia (5 minutos antes del logout)
      warningTimerRef.current = setTimeout(() => {
        // Aquí se podría mostrar un modal de advertencia
        const event = new CustomEvent("sessionWarning");
        window.dispatchEvent(event);
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

      // Timer para logout automático
      inactivityTimerRef.current = setTimeout(() => {
        logout();
        onSessionExpired?.();

        // Mostrar evento de sesión expirada
        const event = new CustomEvent("sessionExpired");
        window.dispatchEvent(event);
      }, INACTIVITY_TIMEOUT);
    };

    // Eventos de actividad del usuario
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, true);
    });

    // Iniciar timer
    resetInactivityTimer();

    return () => {
      // Limpiar listeners y timers
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer, true);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [isAuthenticated, logout, onSessionExpired]);
}

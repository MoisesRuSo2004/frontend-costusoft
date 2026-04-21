import { apiFetch } from "@/app/lib/api";
import type {
  SetPasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/app/types/seguridad";

const BASE = "/api/seguridad";

/**
 * Servicio del módulo Seguridad de Cuentas.
 *
 * Todos los endpoints son PÚBLICOS (no requieren JWT).
 * Se usan cuando el usuario NO tiene sesión activa.
 */
export const seguridadService = {
  /**
   * Activa una cuenta nueva y establece la contraseña inicial.
   * El token expira en 24h y es de un solo uso.
   *
   * POST /api/seguridad/set-password
   */
  async activarCuenta(data: SetPasswordRequest): Promise<void> {
    await apiFetch<void>(`${BASE}/set-password`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Solicita un enlace de recuperación de contraseña al correo indicado.
   * Si el correo no existe, la respuesta es la misma (anti-enumeración).
   * El token expira en 15 minutos.
   *
   * POST /api/seguridad/forgot-password
   */
  async olvidarPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiFetch<void>(`${BASE}/forgot-password`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Resetea la contraseña usando el token recibido por email.
   * El token expira en 15 minutos y solo puede usarse una vez.
   *
   * POST /api/seguridad/reset-password
   */
  async resetearPassword(data: ResetPasswordRequest): Promise<void> {
    await apiFetch<void>(`${BASE}/reset-password`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

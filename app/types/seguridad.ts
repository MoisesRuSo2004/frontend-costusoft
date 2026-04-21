/**
 * Types del módulo Seguridad de Cuentas.
 *
 * Endpoints públicos (sin JWT):
 * POST /api/seguridad/set-password    — activar cuenta nueva + definir password
 * POST /api/seguridad/forgot-password — solicitar link de recuperación
 * POST /api/seguridad/reset-password  — resetear password con el token recibido
 */

export interface SetPasswordRequest {
  /** Token de activación recibido por email (o copiado de DB en desarrollo) */
  token: string;
  /** Contraseña inicial — mínimo 8 caracteres */
  password: string;
  passwordConfirmacion: string;
}

export interface ForgotPasswordRequest {
  /** Correo registrado del usuario */
  correo: string;
}

export interface ResetPasswordRequest {
  /** Token de recuperación recibido por email */
  token: string;
  /** Nueva contraseña — mínimo 8 caracteres */
  passwordNueva: string;
  passwordConfirmacion: string;
}

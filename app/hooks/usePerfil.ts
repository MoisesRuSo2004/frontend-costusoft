"use client";

"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/app/services/auth.service";
import type { UsuarioInfo } from "@/app/types/auth";
import type { ChangePasswordRequest } from "@/app/types/usuario";
import { usuarioService } from "@/app/services/usuario.service";

interface PerfilFormState {
  passwordActual: string;
  passwordNueva: string;
  passwordConfirmacion: string;
}

const INITIAL_PASSWORD_FORM: PerfilFormState = {
  passwordActual: "",
  passwordNueva: "",
  passwordConfirmacion: "",
};

/**
 * Hook para el módulo de Perfil del usuario autenticado.
 *
 * Permite obtener los datos del usuario actual y cambiar la contraseña.
 */
export function usePerfil() {
  // ── State ────────────────────────────────────────────────────────────

  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formPassword, setFormPassword] = useState<PerfilFormState>(INITIAL_PASSWORD_FORM);

  // ── Cargar datos del usuario ─────────────────────────────────────────

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.me();
      setUsuario(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible cargar los datos del perfil.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  // ── Handlers de formulario de contraseña ──────────────────────────────

  const setPasswordField = useCallback(<K extends keyof PerfilFormState>(
    field: K,
    value: string
  ) => {
    setFormPassword((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccessMessage(null);
  }, []);

  const resetPasswordForm = useCallback(() => {
    setFormPassword(INITIAL_PASSWORD_FORM);
  }, []);

  // ── Cambiar contraseña ───────────────────────────────────────────────

  const changePassword = useCallback(async (): Promise<boolean> => {
    // Validaciones
    if (!formPassword.passwordActual.trim()) {
      setError("La contraseña actual es obligatoria.");
      return false;
    }
    if (formPassword.passwordNueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    if (formPassword.passwordNueva !== formPassword.passwordConfirmacion) {
      setError("Las contraseñas no coinciden.");
      return false;
    }

    setChangingPassword(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const request: ChangePasswordRequest = {
        passwordActual: formPassword.passwordActual,
        passwordNueva: formPassword.passwordNueva,
        passwordConfirmacion: formPassword.passwordConfirmacion,
      };

      await usuarioService.cambiarPassword(request);
      setSuccessMessage("Contraseña actualizada exitosamente.");
      resetPasswordForm();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible cambiar la contraseña.";
      setError(msg);
      return false;
    } finally {
      setChangingPassword(false);
    }
  }, [formPassword, resetPasswordForm]);

  // ── Clear messages ────────────────────────────────────────────────────

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // ── Foto de perfil ────────────────────────────────────────────────────

  const updateFotoUrl = useCallback((url: string | null) => {
    setUsuario(prev => prev ? { ...prev, fotoUrl: url } : prev);
    setSuccessMessage(url ? "Foto de perfil actualizada." : "Foto de perfil eliminada.");
  }, []);

  // ── Return ────────────────────────────────────────────────────────────

  return {
    // Datos del usuario
    usuario,
    loading,

    // Formulario de contraseña
    formPassword,
    changingPassword,

    // Estados
    error,
    successMessage,

    // Acciones
    loadUser,
    setPasswordField,
    resetPasswordForm,
    changePassword,
    clearMessages,

    // Foto
    updateFotoUrl,
  };
}

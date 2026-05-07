"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginForm() {
  const { login, rememberedUsername } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar username recordado al montar
  useEffect(() => {
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, [rememberedUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password, rememberMe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-6 sm:px-8">
      {/* Bloque centrado: header + formulario */}
      <div className="flex flex-col justify-center flex-1 py-8 lg:py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1
          className="text-2xl font-semibold mb-1"
          style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
        >
          Iniciar sesión
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: 14,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Bienvenido de nuevo. Ingresa tus credenciales para acceder a tu panel.
        </p>
      </motion.div>

      {/* Formulario */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Usuario */}
        <div>
          <label
            htmlFor="username"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Usuario <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Ingresa tu usuario"
            required
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 16px",
              border: "1.5px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "'Poppins', sans-serif",
              color: "#111827",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
              backgroundColor: "#fff",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#49c21b";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(73,194,27,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Contraseña */}
        <div>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Contraseña <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Ingresa tu contraseña"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 44px 11px 16px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                fontSize: 14,
                fontFamily: "'Poppins', sans-serif",
                color: "#111827",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
                backgroundColor: "#fff",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#49c21b";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(73,194,27,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "#9ca3af",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0b3d91")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              {showPassword ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error del servidor */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: 13,
              color: "#dc2626",
              fontFamily: "'Poppins', sans-serif",
              margin: 0,
            }}
          >
            {error}
          </motion.p>
        )}

        {/* Recuérdame */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13,
              color: "#374151",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <div
              onClick={() => setRememberMe(!rememberMe)}
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: `2px solid ${rememberMe ? "#49c21b" : "#d1d5db"}`,
                backgroundColor: rememberMe ? "#49c21b" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {rememberMe && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            Recuérdame
          </label>

          <Link
            href="/recuperar-password"
            style={{
              fontSize: 13,
              color: "#0b3d91",
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              textDecoration: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#3aad17" : "#49c21b",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Poppins', sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#3aad17";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#49c21b";
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Ingresando...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </motion.form>

      </div>{/* fin bloque centrado */}

      {/* Footer — fuera del bloque centrado para no afectar el centrado vertical */}
      <p
        style={{
          paddingBottom: 24,
          fontSize: 11,
          color: "#d1d5db",
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        © {new Date().getFullYear()} CostuSoft — Todos los derechos reservados
      </p>
    </div>
  );
}

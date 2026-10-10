"use client";

import { Loader2, Power, RefreshCw } from "lucide-react";
import type { EstadoServicio } from "@/app/hooks/useDespertarServicio";

const FUENTE = "var(--font-poppins), sans-serif";

const ESTILO: Record<"activo" | "esperando" | "inactivo", { fondo: string; borde: string; texto: string; punto: string }> = {
  activo: { fondo: "#f0fdf4", borde: "#bbf7d0", texto: "#166534", punto: "#16a34a" },
  esperando: { fondo: "#fffbeb", borde: "#fde68a", texto: "#92400e", punto: "#f59e0b" },
  inactivo: { fondo: "#fef2f2", borde: "#fecaca", texto: "#991b1b", punto: "#dc2626" },
};

/**
 * Estado de un microservicio y botón para despertarlo o volver a verificarlo.
 * Mientras arranca muestra los segundos transcurridos.
 */
export default function EstadoMicroservicio({ nombre, estado, segundos, mensaje, alReintentar }: {
  nombre: string;
  estado: EstadoServicio;
  segundos: number;
  mensaje?: string | null;
  alReintentar: () => void;
}) {
  const esperando = estado === "verificando" || estado === "despertando";
  const estilo = ESTILO[esperando ? "esperando" : estado === "activo" ? "activo" : "inactivo"];
  const texto = estado === "error"
    ? (mensaje ?? "No se pudo verificar el servicio")
    : estado === "activo"
    ? `${nombre} activo`
    : estado === "inactivo"
      ? `${nombre} sin respuesta`
      : estado === "verificando" && segundos < 4
        ? "Verificando servicio…"
        : `Despertando ${nombre.toLowerCase()}… ${segundos} s`;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-live="polite">
      <span className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
        style={{ backgroundColor: estilo.fondo, borderColor: estilo.borde, color: estilo.texto, fontFamily: FUENTE }}>
        {esperando
          ? <Loader2 size={13} className="animate-spin" />
          : <span className="h-2 w-2 rounded-full" style={{ backgroundColor: estilo.punto }} />}
        {texto}
      </span>
      <button type="button" onClick={alReintentar} disabled={esperando}
        title={estado === "activo" ? "Verificar de nuevo el servicio" : "Hacer una petición para que el servicio arranque"}
        className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        style={estado === "inactivo"
          ? { borderColor: "#0b3d91", backgroundColor: "#0b3d91", color: "#fff", fontFamily: FUENTE }
          : { borderColor: "#d0d5dd", backgroundColor: "#fff", color: "#374151", fontFamily: FUENTE }}>
        {estado === "inactivo" ? <Power size={13} /> : <RefreshCw size={13} className={esperando ? "animate-spin" : ""} />}
        {estado === "inactivo" ? "Despertar servicio" : "Actualizar estado"}
      </button>
    </div>
  );
}

/** Aviso grande mientras el servicio arranca, en lugar del contenido. */
export function AvisoDespertando({ nombre, estado, segundos, mensaje, alReintentar }: {
  nombre: string;
  estado: EstadoServicio;
  segundos: number;
  mensaje?: string | null;
  alReintentar: () => void;
}) {
  if (estado === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border px-6 py-14 text-center"
        style={{ borderColor: "#fecaca", backgroundColor: "#fff", fontFamily: FUENTE }}>
        <Power size={30} style={{ color: "#dc2626" }} />
        <p className="text-base font-semibold" style={{ color: "#101828" }}>No se pudo consultar el {nombre.toLowerCase()}</p>
        <p className="max-w-md text-sm" style={{ color: "#667085" }}>{mensaje}</p>
        <a href="/login" className="mt-1 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#0b3d91" }}>
          Iniciar sesión
        </a>
      </div>
    );
  }
  const inactivo = estado === "inactivo";
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border px-6 py-14 text-center"
      style={{ borderColor: inactivo ? "#fecaca" : "#eaecf0", backgroundColor: "#fff", fontFamily: FUENTE }}>
      {inactivo
        ? <Power size={30} style={{ color: "#dc2626" }} />
        : <Loader2 size={30} className="animate-spin" style={{ color: "#7c3aed" }} />}
      <p className="text-base font-semibold" style={{ color: "#101828" }}>
        {inactivo ? `El ${nombre.toLowerCase()} no respondió` : `Despertando el ${nombre.toLowerCase()}…`}
      </p>
      <p className="max-w-md text-sm" style={{ color: "#667085" }}>
        {inactivo
          ? "Puede estar arrancando todavía o reiniciándose. Intenta despertarlo de nuevo."
          : "Si nadie lo usó en los últimos minutos, el servidor lo apaga para ahorrar recursos y tarda entre 30 y 60 segundos en volver."}
      </p>
      {!inactivo && segundos >= 4 && (
        <p className="text-xs font-medium tabular-nums" style={{ color: "#98a2b3" }}>{segundos} s</p>
      )}
      {inactivo && (
        <button type="button" onClick={alReintentar}
          className="mt-1 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#0b3d91" }}>
          <Power size={15} /> Despertar servicio
        </button>
      )}
    </div>
  );
}

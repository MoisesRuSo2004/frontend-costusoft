"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { institucionService } from "@/app/services/institucion.service";
import type { EstadoSolicitud, SolicitudResponse, PageSolicitudes } from "@/app/types/institucion";

// ─── Config ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoSolicitud, { label: string; color: string; bg: string }> = {
  PENDIENTE:   { label: "Pendiente",   color: "#d97706", bg: "#fffbeb" },
  EN_REVISION: { label: "En revisión", color: "#2563eb", bg: "#eff6ff" },
  RESUELTA:    { label: "Resuelta ✓",  color: "#16a34a", bg: "#f0fdf4" },
  RECHAZADA:   { label: "Rechazada",   color: "#dc2626", bg: "#fef2f2" },
};

const TIPO_LABELS: Record<string, string> = {
  AJUSTE_TALLA:         "Ajuste de talla",
  PEDIDO_URGENTE:       "Pedido urgente",
  CAMBIO_FECHA_ENTREGA: "Cambio de fecha de entrega",
  CONSULTA_GENERAL:     "Consulta general",
  DEVOLUCION:           "Devolución / corrección",
};

const TABS: { value: EstadoSolicitud | ""; label: string }[] = [
  { value: "",           label: "Todas" },
  { value: "PENDIENTE",  label: "Pendientes" },
  { value: "EN_REVISION", label: "En revisión" },
  { value: "RESUELTA",   label: "Resueltas" },
  { value: "RECHAZADA",  label: "Rechazadas" },
];

function formatFecha(str: string) {
  return new Date(str).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SolicitudesPage() {
  const [tab, setTab] = useState<EstadoSolicitud | "">("");
  const [data, setData] = useState<PageSolicitudes | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (tab_: EstadoSolicitud | "" = tab, p = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await institucionService.listarSolicitudes({
        estado: tab_ || undefined,
        page: p,
        size: 10,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(tab, page); }, [tab, page]);

  const solicitudes: SolicitudResponse[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  const cambiarTab = (t: EstadoSolicitud | "") => {
    setTab(t);
    setPage(0);
  };

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
          >
            Mis Solicitudes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
            Consulta el estado de tus solicitudes al equipo Costusoft.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => cargar(tab, page)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
            style={{
              borderColor: "#e5e7eb",
              backgroundColor: "#ffffff",
              color: "#374151",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
          <Link
            href="/institucion/solicitudes/nueva"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "#6366f1", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6366f1")}
          >
            <PlusCircle size={15} />
            Nueva solicitud
          </Link>
        </div>
      </motion.div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-2xl border px-5 py-3.5"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
        >
          <AlertCircle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
        </div>
      )}

      {/* ── Tabs + Tabla ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border overflow-hidden"
        style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
      >
        {/* Tabs */}
        <div
          className="flex overflow-x-auto border-b"
          style={{ borderColor: "#f3f4f6" }}
        >
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => cambiarTab(value)}
              className="flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors"
              style={{
                color: tab === value ? "#6366f1" : "#6b7280",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: tab === value ? "2px solid #6366f1" : "2px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="divide-y" style={{ borderColor: "#f9fafb" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-48 animate-pulse rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
                  <div className="h-3 w-72 animate-pulse rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
                </div>
              </div>
            ))
          ) : solicitudes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <MessageSquarePlus size={32} style={{ color: "#d1d5db" }} />
              <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {tab ? "No hay solicitudes con ese estado." : "Aún no tienes solicitudes."}
              </p>
              <Link
                href="/institucion/solicitudes/nueva"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "#6366f1", textDecoration: "none" }}
              >
                <PlusCircle size={14} /> Crear solicitud
              </Link>
            </div>
          ) : (
            solicitudes.map((sol) => {
              const cfg = ESTADO_CONFIG[sol.estado] ?? ESTADO_CONFIG["PENDIENTE"];
              return (
                <div
                  key={sol.id}
                  className="flex items-start justify-between gap-4 p-5 transition-colors"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "#fafafa")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent")}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
                      >
                        {sol.asunto}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ color: cfg.color, backgroundColor: cfg.bg, fontFamily: "'Poppins', sans-serif" }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p
                      className="text-xs mb-1.5"
                      style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}
                    >
                      {TIPO_LABELS[sol.tipo] ?? sol.tipo} · {formatFecha(sol.createdAt)}
                    </p>
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}
                    >
                      {sol.descripcion}
                    </p>

                    {sol.respuesta && (
                      <div
                        className="mt-2 rounded-xl border px-3 py-2"
                        style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}
                      >
                        <p className="text-xs font-semibold mb-0.5" style={{ color: "#16a34a", fontFamily: "'Poppins', sans-serif" }}>
                          Respuesta de Costusoft:
                        </p>
                        <p className="text-xs" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                          {sol.respuesta}
                        </p>
                        {sol.fechaRespuesta && (
                          <p className="mt-0.5 text-[10px]" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                            {formatFecha(sol.fechaRespuesta)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginación */}
        {data && data.totalPages > 1 && (
          <div
            className="flex items-center justify-between border-t px-4 py-3"
            style={{ borderColor: "#f3f4f6" }}
          >
            <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              {data.totalElements} solicitud{data.totalElements !== 1 ? "es" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{
                  borderColor: "#e5e7eb",
                  backgroundColor: page === 0 ? "#f9fafb" : "#ffffff",
                  color: page === 0 ? "#d1d5db" : "#374151",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border"
                style={{
                  borderColor: "#e5e7eb",
                  backgroundColor: page >= totalPages - 1 ? "#f9fafb" : "#ffffff",
                  color: page >= totalPages - 1 ? "#d1d5db" : "#374151",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}

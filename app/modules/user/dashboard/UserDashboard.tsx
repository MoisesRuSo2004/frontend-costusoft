"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, AlertCircle,
  CheckCircle2, Clock, XCircle, Plus, AlertTriangle,
  Package, TrendingUp, Activity, Loader2,
} from "lucide-react";
import { useUserDashboard, type ActividadItem } from "@/app/hooks/useUserDashboard";
import { useAuth } from "@/app/context/AuthContext";
import type { EstadoMovimiento } from "@/app/types/entrada";

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const ESTADO_CFG: Record<EstadoMovimiento, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  PENDIENTE:  { label: "Pendiente",  bg: "#fef9c3", color: "#a16207", icon: Clock },
  CONFIRMADA: { label: "Confirmada", bg: "#f0fdf4", color: "#16a34a", icon: CheckCircle2 },
  RECHAZADA:  { label: "Rechazada",  bg: "#fef2f2", color: "#dc2626", icon: XCircle },
};

function EstadoBadge({ estado }: { estado: EstadoMovimiento }) {
  const cfg = ESTADO_CFG[estado];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color, fontFamily: "'Poppins', sans-serif" }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function ActividadRow({ item, index }: { item: ActividadItem; index: number }) {
  const esEntrada = item.tipo === "entrada";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 py-3.5 px-5"
      style={{ borderBottom: "1px solid #f9fafb" }}>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: esEntrada ? "#f0fdf4" : "#fef3c7" }}>
        {esEntrada
          ? <ArrowDownToLine size={15} style={{ color: "#16a34a" }} />
          : <ArrowUpFromLine size={15} style={{ color: "#d97706" }} />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate"
          style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
          {item.titulo}
        </p>
        <p className="text-xs truncate mt-0.5"
          style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
          {item.subtitulo} · {item.insumos} insumo{item.insumos !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0">
        <EstadoBadge estado={item.estado} />
        <span className="text-[11px]" style={{ color: "#d1d5db", fontFamily: "'Poppins', sans-serif" }}>
          {fmtDate(item.fecha)}
        </span>
      </div>
    </motion.div>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const {
    totalEntradas, totalSalidas, pendientes, confirmadas,
    actividad, stockBajo, loading, error, recargar,
  } = useUserDashboard();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos dias";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <section className="flex flex-col gap-6 pb-8">

      {/* Header */}
      <div className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbeafe",
          background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)",
        }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#1d4ed8", fontFamily: "'Poppins', sans-serif" }}>
              Panel Secretaria
            </p>
            <h1 className="mt-2 text-2xl font-semibold"
              style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              {greeting}{user?.username ? `, ${user.username}` : ""}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#475467", fontFamily: "'Poppins', sans-serif" }}>
              Gestiona tus solicitudes de entrada y salida. Bodega confirma cada movimiento.
            </p>
          </div>
          <button onClick={recargar}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: "#bfdbfe", backgroundColor: "#fff",
              color: "#1d4ed8", fontFamily: "'Poppins', sans-serif", cursor: "pointer",
            }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Entradas creadas", value: totalEntradas, color: "#1d4ed8", bg: "#eff6ff",  Icon: ArrowDownToLine },
          { label: "Salidas creadas",  value: totalSalidas,  color: "#d97706", bg: "#fef3c7",  Icon: ArrowUpFromLine },
          { label: "Pendientes",       value: pendientes,    color: "#ca8a04", bg: "#fefce8",  Icon: Clock },
          { label: "Confirmadas",      value: confirmadas,   color: "#16a34a", bg: "#f0fdf4",  Icon: CheckCircle2 },
        ].map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border p-5"
            style={{ borderColor: "#f3f4f6", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {k.label}
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: k.bg }}>
                <k.Icon size={15} style={{ color: k.color }} />
              </div>
            </div>
            {loading
              ? <div className="h-8 w-12 animate-pulse rounded-lg" style={{ backgroundColor: "#f3f4f6" }} />
              : <p className="text-3xl font-bold"
                  style={{ color: k.color, fontFamily: "'Poppins', sans-serif" }}>{k.value}</p>
            }
          </motion.div>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <AlertCircle size={16} style={{ color: "#dc2626" }} />
            <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acciones rapidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/user/entradas/add"
          className="group flex items-center gap-4 rounded-2xl border p-5 transition hover:shadow-md"
          style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4", textDecoration: "none" }}>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: "#16a34a", boxShadow: "0 4px 12px rgba(22,163,74,0.30)" }}>
            <ArrowDownToLine size={20} style={{ color: "#fff" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: "#15803d", fontFamily: "'Poppins', sans-serif" }}>
              Solicitar entrada
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#4ade80", fontFamily: "'Poppins', sans-serif" }}>
              Registrar ingreso de insumos al inventario
            </p>
          </div>
          <Plus size={18} className="ml-auto flex-shrink-0 transition-transform group-hover:rotate-90"
            style={{ color: "#16a34a" }} />
        </Link>

        <Link href="/user/salidas/add"
          className="group flex items-center gap-4 rounded-2xl border p-5 transition hover:shadow-md"
          style={{ borderColor: "#fde68a", backgroundColor: "#fef3c7", textDecoration: "none" }}>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: "#d97706", boxShadow: "0 4px 12px rgba(217,119,6,0.30)" }}>
            <ArrowUpFromLine size={20} style={{ color: "#fff" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: "#92400e", fontFamily: "'Poppins', sans-serif" }}>
              Solicitar salida
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#fcd34d", fontFamily: "'Poppins', sans-serif" }}>
              Despacho de insumos para produccion o colegios
            </p>
          </div>
          <Plus size={18} className="ml-auto flex-shrink-0 transition-transform group-hover:rotate-90"
            style={{ color: "#d97706" }} />
        </Link>
      </div>

      {/* Grid: Actividad + Stock bajo */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">

        {/* Actividad reciente */}
        <div className="rounded-2xl border bg-white overflow-hidden"
          style={{ borderColor: "#f3f4f6", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #f3f4f6" }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#eff6ff" }}>
                <Activity size={15} style={{ color: "#1d4ed8" }} />
              </div>
              <div>
                <p className="text-sm font-bold"
                  style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                  Actividad reciente
                </p>
                <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                  Ultimas entradas y salidas del sistema
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5"
                style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                <ArrowDownToLine size={10} /> Entrada
              </span>
              <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5"
                style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                <ArrowUpFromLine size={10} /> Salida
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 size={18} className="animate-spin" style={{ color: "#1d4ed8" }} />
              <span className="text-sm"
                style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Cargando actividad...
              </span>
            </div>
          ) : actividad.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <TrendingUp size={32} style={{ color: "#e5e7eb" }} />
              <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Sin actividad registrada.
              </p>
              <p className="text-xs" style={{ color: "#d1d5db", fontFamily: "'Poppins', sans-serif" }}>
                Crea tu primera solicitud usando los botones de arriba.
              </p>
            </div>
          ) : (
            actividad.map((item, i) => <ActividadRow key={item.key} item={item} index={i} />)
          )}
        </div>

        {/* Alertas stock bajo */}
        <div className="rounded-2xl border bg-white overflow-hidden"
          style={{ borderColor: "#f3f4f6", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center gap-2.5 px-5 py-4"
            style={{ borderBottom: "1px solid #f3f4f6" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#fff7ed" }}>
              <AlertTriangle size={15} style={{ color: "#ea580c" }} />
            </div>
            <div>
              <p className="text-sm font-bold"
                style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Alertas de stock
              </p>
              <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Insumos bajo el minimo
              </p>
            </div>
            {!loading && stockBajo.length > 0 && (
              <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
                style={{ backgroundColor: "#ef4444" }}>
                {stockBajo.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 size={16} className="animate-spin" style={{ color: "#ea580c" }} />
            </div>
          ) : stockBajo.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <CheckCircle2 size={28} style={{ color: "#86efac" }} />
              <p className="text-sm" style={{ color: "#16a34a", fontFamily: "'Poppins', sans-serif" }}>
                Stock normalizado
              </p>
            </div>
          ) : (
            <div>
              <div className="divide-y" style={{ borderColor: "#f9fafb" }}>
                {stockBajo.map((ins, i) => (
                  <motion.div key={ins.id}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "#fff7ed" }}>
                      <Package size={13} style={{ color: "#ea580c" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate"
                        style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                        {ins.nombre}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>
                          {ins.stock} {ins.unidadMedida}
                        </span>
                        <span className="text-xs" style={{ color: "#d1d5db" }}>
                          / min {ins.stockMinimo}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: "#f3f4f6" }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(Math.round((ins.stock / Math.max(ins.stockMinimo, 1)) * 100), 100)}%`,
                          backgroundColor: ins.stock === 0 ? "#dc2626" : "#f97316",
                        }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-5 py-3" style={{ borderTop: "1px solid #f9fafb" }}>
                <Link href="/user/entradas/add"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: "#1d4ed8", fontFamily: "'Poppins', sans-serif" }}>
                  Solicitar entrada para reponer
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, Package, AlertCircle, X,
  ArrowDownToLine, ArrowUpFromLine,
  Eye, TrendingDown,
} from "lucide-react";
import { useInsumos } from "@/app/hooks/useInsumos";
import type { InsumoResponse } from "@/app/types/insumo";
import Paginator from "@/app/components/shared/ui/Paginator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estadoStock(insumo: InsumoResponse): "Disponible" | "Stock bajo" | "Sin stock" {
  if (insumo.stock <= 0) return "Sin stock";
  if (insumo.stock <= insumo.stockMinimo) return "Stock bajo";
  return "Disponible";
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  "Disponible": { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  "Stock bajo":  { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  "Sin stock":   { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
};

function StockBadge({ insumo }: { insumo: InsumoResponse }) {
  const estado = estadoStock(insumo);
  const st = ESTADO_STYLE[estado];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: st.bg, color: st.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
      {estado}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function InventarioUserClient() {
  const {
    data, stockBajo, loading, error, page, setPage,
    search, buscar, reload, clearMessages,
  } = useInsumos();

  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => buscar(val), 400);
  };

  const insumos      = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages   = data?.totalPages ?? 0;
  const sinStock     = insumos.filter((i) => i.stock <= 0).length;
  const conStockBajo = stockBajo.length;

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-[28px] border px-6 py-5"
        style={{
          borderColor: "#dbe4ff",
          background: "linear-gradient(135deg, rgba(29,78,216,0.07) 0%, rgba(96,165,250,0.06) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {/* badge solo consulta */}
            <span
              className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ backgroundColor: "rgba(29,78,216,0.10)", color: "#1d4ed8" }}
            >
              <Eye size={11} /> Solo consulta
            </span>
            <h1
              className="mt-1 text-2xl font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Inventario de Insumos
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Consulta el stock disponible. Para registrar movimientos usa los accesos directos.
            </p>
          </div>

          {/* Accesos directos */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/user/entradas/add"
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
              style={{ borderColor: "#22c55e", color: "#16a34a", backgroundColor: "#f0fdf4", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              <ArrowDownToLine size={15} /> Nueva Entrada
            </Link>
            <Link
              href="/user/salidas/add"
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
              style={{ borderColor: "#fbbf24", color: "#b45309", backgroundColor: "#fffbeb", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              <ArrowUpFromLine size={15} /> Nueva Salida
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total insumos",  value: totalElements,                                                         color: "#1d4ed8", bg: "rgba(29,78,216,0.07)"  },
          { label: "Disponibles",    value: insumos.filter((i) => estadoStock(i) === "Disponible").length,         color: "#16a34a", bg: "rgba(22,163,74,0.07)"  },
          { label: "Stock bajo",     value: conStockBajo,                                                           color: "#b45309", bg: "rgba(180,83,9,0.07)"   },
          { label: "Sin stock",      value: sinStock,                                                               color: "#dc2626", bg: "rgba(220,38,38,0.07)"  },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-3xl border p-4"
            style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {kpi.label}
            </p>
            <p
              className="mt-2 text-3xl font-bold"
              style={{ color: kpi.color, fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Alerta stock bajo ─────────────────────────────────────────────── */}
      {conStockBajo > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb" }}
        >
          <TrendingDown size={16} style={{ color: "#b45309", flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm" style={{ color: "#92400e", fontFamily: "var(--font-poppins), sans-serif" }}>
            <strong>{conStockBajo} insumo{conStockBajo !== 1 ? "s" : ""}</strong> con stock por debajo del mínimo.
            Comunícalo al administrador o{" "}
            <Link href="/user/entradas/add" className="underline font-semibold" style={{ color: "#b45309" }}>
              crea una entrada
            </Link>
            .
          </p>
        </motion.div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
          >
            <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
            <p className="flex-1 text-sm" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>{error}</p>
            <button onClick={clearMessages}><X size={14} style={{ color: "#fca5a5" }} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-3xl border"
        style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "#f0f0f4" }}
        >
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
            <input
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar insumo por nombre..."
              className="w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            />
          </div>
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition"
            style={{ borderColor: "#e5e7eb", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {/* Contenido */}
        {loading && !data ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl" style={{ backgroundColor: "#f3f4f6" }} />
            ))}
          </div>
        ) : insumos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={40} style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
              {search ? `Sin resultados para "${search}"` : "No hay insumos registrados"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f4" }}>
                  {["#", "Nombre", "Tipo", "Unidad", "Stock", "Mínimo", "Estado"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {insumos.map((insumo, idx) => {
                  const inactivo = insumo.activo === false;
                  return (
                    <tr
                      key={insumo.id}
                      style={{ borderBottom: "1px solid #f9fafb", opacity: inactivo ? 0.5 : 1 }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-5 py-4 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {page * 10 + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0"
                            style={{ backgroundColor: inactivo ? "rgba(156,163,175,0.12)" : "rgba(29,78,216,0.08)" }}
                          >
                            <Package size={14} style={{ color: inactivo ? "#9ca3af" : "#1d4ed8" }} />
                          </div>
                          <div>
                            <span
                              className="text-sm font-medium"
                              style={{ color: inactivo ? "#9ca3af" : "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                            >
                              {insumo.nombre}
                            </span>
                            {inactivo && (
                              <span
                                className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                              >
                                INACTIVO
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {insumo.tipo || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {insumo.unidadMedida}
                      </td>
                      <td
                        className="px-5 py-4 text-sm font-semibold"
                        style={{
                          color: inactivo
                            ? "#9ca3af"
                            : insumo.stock <= 0
                            ? "#dc2626"
                            : insumo.stock <= insumo.stockMinimo
                            ? "#b45309"
                            : "#101828",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {insumo.stock}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {insumo.stockMinimo}
                      </td>
                      <td className="px-5 py-4">
                        {inactivo ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#9ca3af" }} />
                            Inactivo
                          </span>
                        ) : (
                          <StockBadge insumo={insumo} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 pb-5">
          <Paginator
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={10}
            label="insumos"
            accentColor="#1d4ed8"
            onChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { institucionService } from "@/app/services/institucion.service";
import type { PagePedidos } from "@/app/types/institucion";
import type { PedidoResponse, EstadoPedido } from "@/app/types/pedido";

// ─── Estado config ────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoPedido, { label: string; color: string; bg: string }> = {
  BORRADOR:            { label: "Borrador",           color: "#6b7280", bg: "#f9fafb" },
  CALCULADO:           { label: "Calculado",           color: "#2563eb", bg: "#eff6ff" },
  CONFIRMADO:          { label: "Confirmado",          color: "#0891b2", bg: "#ecfeff" },
  EN_PRODUCCION:       { label: "En producción",       color: "#d97706", bg: "#fffbeb" },
  LISTO_PARA_ENTREGA:  { label: "Listo para entrega",  color: "#16a34a", bg: "#f0fdf4" },
  ENTREGADO:           { label: "Entregado ✓",         color: "#15803d", bg: "#dcfce7" },
  CANCELADO:           { label: "Cancelado",           color: "#dc2626", bg: "#fef2f2" },
};

function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: "#6b7280", bg: "#f9fafb" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg, fontFamily: "'Poppins', sans-serif" }}
    >
      {cfg.label}
    </span>
  );
}

function formatFecha(str: string) {
  return new Date(str).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded-full" style={{ backgroundColor: "#e5e7eb", width: i === 0 ? "80%" : "60%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const [data, setData] = useState<PagePedidos | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await institucionService.listarPedidos({ page: p, size: 10 });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(page); }, [page]);

  const pedidos: PedidoResponse[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
          >
            Mis Pedidos
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
            Historial y estado de pedidos de uniformes de tu colegio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => cargar(page)}
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
            href="/institucion/pedidos/nuevo"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#6366f1", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6366f1")}
          >
            <PlusCircle size={15} />
            Nuevo pedido
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

      {/* ── Tabla ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #eaecf0" }}>
                {["N° Pedido", "Estado", "Fecha", "Entrega Est.", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <ClipboardList size={32} style={{ color: "#d1d5db", margin: "0 auto 8px" }} />
                    <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                      Aún no tienes pedidos registrados.
                    </p>
                    <Link
                      href="/institucion/pedidos/nuevo"
                      className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                      style={{ backgroundColor: "#6366f1", textDecoration: "none" }}
                    >
                      <PlusCircle size={14} /> Crear primer pedido
                    </Link>
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido, idx) => (
                  <tr
                    key={pedido.id}
                    style={{
                      borderBottom: idx < pedidos.length - 1 ? "1px solid #f3f4f6" : "none",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#fafafa")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
                      >
                        {pedido.numeroPedido ?? `#${pedido.id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={pedido.estado as EstadoPedido} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                        {formatFecha(pedido.fechaCreacion ?? "")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                        {pedido.fechaEstimadaEntrega ? formatFecha(pedido.fechaEstimadaEntrega) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/institucion/pedidos/${pedido.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: "#eef2ff",
                          color: "#6366f1",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e7ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eef2ff")}
                      >
                        <Eye size={12} /> Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {data && data.totalPages > 1 && (
          <div
            className="flex items-center justify-between border-t px-4 py-3"
            style={{ borderColor: "#f3f4f6" }}
          >
            <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              {data.totalElements} pedido{data.totalElements !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
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

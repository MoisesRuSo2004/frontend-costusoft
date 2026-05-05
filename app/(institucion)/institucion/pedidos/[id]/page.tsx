"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Package,
  RefreshCw,
  Shirt,
  User,
} from "lucide-react";
import { institucionService } from "@/app/services/institucion.service";
import type { HistorialPedidoResponse } from "@/app/types/institucion";
import type { PedidoResponse, EstadoPedido, DetallePedidoResponse } from "@/app/types/pedido";

// ─── Estado config ────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  BORRADOR:            { label: "Borrador",           color: "#6b7280", bg: "#f9fafb",  border: "#e5e7eb" },
  CALCULADO:           { label: "Calculado",           color: "#2563eb", bg: "#eff6ff",  border: "#bfdbfe" },
  CONFIRMADO:          { label: "Confirmado",          color: "#0891b2", bg: "#ecfeff",  border: "#a5f3fc" },
  EN_PRODUCCION:       { label: "En producción",       color: "#d97706", bg: "#fffbeb",  border: "#fde68a" },
  LISTO_PARA_ENTREGA:  { label: "Listo para entrega",  color: "#16a34a", bg: "#f0fdf4",  border: "#bbf7d0" },
  ENTREGADO:           { label: "Entregado ✓",         color: "#15803d", bg: "#dcfce7",  border: "#86efac" },
  CANCELADO:           { label: "Cancelado",           color: "#dc2626", bg: "#fef2f2",  border: "#fecaca" },
};

// ─── Stepper ──────────────────────────────────────────────────────────────────

const STEPS: EstadoPedido[] = [
  "BORRADOR",
  "CALCULADO",
  "CONFIRMADO",
  "EN_PRODUCCION",
  "LISTO_PARA_ENTREGA",
  "ENTREGADO",
];

function PedidoStepper({ estado }: { estado: string }) {
  if (estado === "CANCELADO") {
    return (
      <div
        className="flex items-center gap-2 rounded-2xl border px-4 py-3"
        style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
      >
        <AlertCircle size={16} style={{ color: "#dc2626" }} />
        <span className="text-sm font-semibold" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
          Pedido cancelado
        </span>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(estado as EstadoPedido);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STEPS.map((step, idx) => {
        const cfg = ESTADO_CONFIG[step];
        const done = idx < currentIdx;
        const active = idx === currentIdx;

        return (
          <div key={step} className="flex items-center">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: active ? cfg.bg : done ? "#f0fdf4" : "#f9fafb",
                color: active ? cfg.color : done ? "#16a34a" : "#9ca3af",
                border: `1px solid ${active ? cfg.border : done ? "#bbf7d0" : "#e5e7eb"}`,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {done ? <CheckCircle2 size={11} /> : null}
              {cfg.label}
            </div>
            {idx < STEPS.length - 1 && (
              <ChevronRight size={12} style={{ color: "#d1d5db", margin: "0 2px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function Timeline({ historial }: { historial: HistorialPedidoResponse[] }) {
  if (historial.length === 0) {
    return (
      <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
        Sin historial disponible.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {historial.map((item, idx) => {
        const isLast = idx === historial.length - 1;
        const cfg = ESTADO_CONFIG[item.estadoNuevo] ?? ESTADO_CONFIG["BORRADOR"];

        return (
          <div key={item.id} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.color }}
              >
                <CheckCircle2 size={14} />
              </div>
              {!isLast && (
                <div className="mt-1 w-0.5 flex-1" style={{ backgroundColor: "#e5e7eb", minHeight: 20 }} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: cfg.color, fontFamily: "'Poppins', sans-serif" }}
                  >
                    {item.accion}
                  </span>
                  {item.observacion && (
                    <p className="mt-0.5 text-xs" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                      {item.observacion}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <User size={11} style={{ color: "#9ca3af" }} />
                    <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                      {item.realizadoPor}
                    </span>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-xs"
                  style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
                >
                  {item.fechaAccion}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Detalles de prendas ──────────────────────────────────────────────────────

function PrendasTable({ detalles }: { detalles: DetallePedidoResponse[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
            {["Prenda", "Tipo", "Talla", "Género", "Cantidad"].map((h) => (
              <th
                key={h}
                className="pb-3 text-left text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {detalles.map((d, idx) => (
            <tr
              key={d.id}
              style={{ borderBottom: idx < detalles.length - 1 ? "1px solid #f9fafb" : "none" }}
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <Shirt size={14} style={{ color: "#6366f1", flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                    {d.nombreUniforme}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                  {d.tipo}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "#eef2ff", color: "#6366f1", fontFamily: "'Poppins', sans-serif" }}
                >
                  {d.talla}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                  {d.genero ?? "—"}
                </span>
              </td>
              <td className="py-3">
                <span className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                  {d.cantidad}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PedidoDetallePage() {
  const params = useParams();
  const id = Number(params.id);

  const [pedido, setPedido] = useState<PedidoResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialPedidoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      // Carga crítica — si falla, mostramos el error
      const p = await institucionService.obtenerPedido(id);
      setPedido(p);

      // Carga no-crítica — el historial puede no existir aún (pedido BORRADOR recién creado)
      try {
        const h = await institucionService.obtenerHistorial(id);
        setHistorial(h);
      } catch {
        // Sin historial disponible: mostramos timeline vacío, no bloqueamos la página
        setHistorial([]);
      }
    } catch (err) {
      if (err instanceof Error) {
        const anyErr = err as any;
        setError(anyErr?.body?.message ?? anyErr.message ?? `Error ${anyErr?.status ?? ""}`);
      } else {
        setError("Error al cargar el pedido.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  if (loading) {
    return (
      <section className="flex flex-col gap-6 pb-10">
        <div className="h-8 w-48 animate-pulse rounded-xl" style={{ backgroundColor: "#e5e7eb" }} />
        <div className="h-32 animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
        <div className="h-48 animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* Volver */}
      <Link
        href="/institucion/pedidos"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
      >
        <ArrowLeft size={15} /> Volver a mis pedidos
      </Link>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-2xl border px-5 py-3.5"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
        >
          <AlertCircle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
        </div>
      )}

      {pedido && (
        <>
          {/* ── Header del pedido ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border p-6"
            style={{
              borderColor: "#eaecf0",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} style={{ color: "#6366f1" }} />
                  <h1
                    className="text-xl font-bold"
                    style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {pedido.numeroPedido ?? `Pedido #${pedido.id}`}
                  </h1>
                </div>
                <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                  {pedido.observaciones ?? "Sin observaciones"}
                </p>
              </div>
              <button
                onClick={cargar}
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors"
                style={{
                  borderColor: "#e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                <RefreshCw size={13} />
                Actualizar
              </button>
            </div>

            {/* Stepper */}
            <PedidoStepper estado={pedido.estado} />

            {/* Meta */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              <span>Creado: <strong style={{ color: "#374151" }}>{pedido.fechaCreacion}</strong></span>
              {pedido.fechaEstimadaEntrega && (
                <span>Entrega estimada: <strong style={{ color: "#374151" }}>{pedido.fechaEstimadaEntrega}</strong></span>
              )}
              {pedido.porcentajeCumplimiento !== null && (
                <span>
                  Cumplimiento: <strong style={{ color: pedido.porcentajeCumplimiento >= 100 ? "#16a34a" : "#d97706" }}>
                    {pedido.porcentajeCumplimiento}%
                  </strong>
                </span>
              )}
            </div>
          </motion.div>

          {/* ── Prendas ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border p-6"
            style={{
              borderColor: "#eaecf0",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
            }}
          >
            <h2
              className="mb-4 flex items-center gap-2 text-base font-semibold"
              style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
            >
              <Package size={16} style={{ color: "#6366f1" }} />
              Prendas del pedido ({pedido.detalles?.length ?? 0})
            </h2>

            {pedido.detalles && pedido.detalles.length > 0 ? (
              <PrendasTable detalles={pedido.detalles} />
            ) : (
              <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Sin prendas registradas.
              </p>
            )}
          </motion.div>

          {/* ── Historial / Timeline ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-3xl border p-6"
            style={{
              borderColor: "#eaecf0",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
            }}
          >
            <h2
              className="mb-5 flex items-center gap-2 text-base font-semibold"
              style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
            >
              <CheckCircle2 size={16} style={{ color: "#6366f1" }} />
              Historial del pedido
            </h2>
            <Timeline historial={historial} />
          </motion.div>
        </>
      )}
    </section>
  );
}

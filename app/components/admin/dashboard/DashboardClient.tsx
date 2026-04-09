"use client";

import { motion } from "framer-motion";
import {
  Archive,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Activity,
  RefreshCw,
} from "lucide-react";
import StatCard from "./StatCard";

// ── Stat cards config ────────────────────────────────────
const STATS = [
  {
    label: "Total Insumos",
    value: "—", // TODO: fetch desde API
    icon: Archive,
    accentColor: "#0b3d91",
    delay: 0,
  },
  {
    label: "Total Entradas",
    value: "—",
    icon: ArrowDownToLine,
    accentColor: "#49c21b",
    delay: 0.08,
  },
  {
    label: "Total Salidas",
    value: "—",
    icon: ArrowUpFromLine,
    accentColor: "#3b82f6",
    delay: 0.16,
  },
  {
    label: "Insumos en Cero",
    value: "—",
    icon: AlertTriangle,
    accentColor: "#f59e0b",
    delay: 0.24,
  },
];

// ── Actividad reciente placeholder ───────────────────────
const RECENT: {
  tipo: "entrada" | "salida";
  insumo: string;
  cantidad: number;
  usuario: string;
  fecha: string;
}[] = [
  {
    tipo: "entrada",
    insumo: "Hilo 40/2 Blanco",
    cantidad: 500,
    usuario: "admin",
    fecha: "Hoy, 09:14",
  },
  {
    tipo: "salida",
    insumo: "Tela Popelina",
    cantidad: 30,
    usuario: "admin",
    fecha: "Hoy, 08:50",
  },
  {
    tipo: "entrada",
    insumo: "Botones 15mm Negros",
    cantidad: 1000,
    usuario: "admin",
    fecha: "Ayer, 16:32",
  },
  {
    tipo: "salida",
    insumo: "Cierre Invisible 60cm",
    cantidad: 50,
    usuario: "admin",
    fecha: "Ayer, 14:08",
  },
  {
    tipo: "salida",
    insumo: "Elástico 2cm",
    cantidad: 200,
    usuario: "admin",
    fecha: "Ayer, 10:45",
  },
];

export default function DashboardClient() {
  return (
    <div className="flex flex-col gap-7 pb-7">
      {/* ── Page heading ── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
          >
            Dashboard
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
          >
            Resumen general del sistema de control de insumos
          </p>
        </div>

        {/* Actualizar — placeholder visual */}
        <button
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
          style={{
            backgroundColor: "#fff",
            border: "1.5px solid #e5e7eb",
            color: "#374151",
            fontFamily: "'Poppins', sans-serif",
            cursor: "pointer",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#0b3d91";
            e.currentTarget.style.color = "#0b3d91";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#374151";
          }}
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── PowerBI iframe ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
          border: "1px solid #f0f0f4",
        }}
      >
        {/* Header del panel */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: "1px solid #f0f0f4" }}
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, backgroundColor: "#0b3d9110" }}
          >
            <Activity size={16} style={{ color: "#0b3d91" }} />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
            >
              Analíticas — Power BI
            </p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Dashboard de métricas operacionales
            </p>
          </div>
        </div>

        {/* iFrame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "52%",
            height: 0,
          }}
        >
          <iframe
            title="Dashboard CostuSoft — Power BI"
            src="https://app.powerbi.com/reportEmbed?reportId=aa91f679-4a0e-41e0-9de1-252cca321d02&autoAuth=true&ctid=9d12bf3f-e4f6-47ab-912f-1a2f0fc48aa4"
            frameBorder={0}
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>
      </motion.div>

      {/* ── Actividad reciente ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
          border: "1px solid #f0f0f4",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #f0f0f4" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 32, height: 32, backgroundColor: "#49c21b18" }}
            >
              <Activity size={16} style={{ color: "#49c21b" }} />
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
            >
              Actividad reciente
            </p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              backgroundColor: "#f5f6fa",
              color: "#6b7280",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Últimos movimientos
          </span>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                {["Tipo", "Insumo", "Cantidad", "Usuario", "Fecha"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "'Poppins', sans-serif",
                      borderBottom: "1px solid #f0f0f4",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < RECENT.length - 1 ? "1px solid #f7f7f9" : "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fafbff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td className="px-6 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          row.tipo === "entrada" ? "#49c21b18" : "#0b3d9112",
                        color: row.tipo === "entrada" ? "#2a9912" : "#0b3d91",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {row.tipo === "entrada" ? (
                        <ArrowDownToLine size={11} />
                      ) : (
                        <ArrowUpFromLine size={11} />
                      )}
                      {row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1)}
                    </span>
                  </td>
                  <td
                    className="px-6 py-3 text-sm font-medium"
                    style={{
                      color: "#374151",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {row.insumo}
                  </td>
                  <td
                    className="px-6 py-3 text-sm"
                    style={{
                      color: "#374151",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {row.cantidad.toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-3 text-sm"
                    style={{
                      color: "#6b7280",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {row.usuario}
                  </td>
                  <td
                    className="px-6 py-3 text-xs"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {row.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

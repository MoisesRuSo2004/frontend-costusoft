"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Play,
  Clock,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
} from "lucide-react";
import { useOptimizacion } from "@/app/hooks/useOptimizacion";
import { optimizacionService } from "@/app/services/optimizacion.service";
import type { HistorialItem, OptimizacionResponse } from "@/app/types/optimizacion";

// ── Constantes de presentación ────────────────────────────────────────────────
const NOMBRES_PRENDAS: Record<string, string> = {
  pantalon_diario: "Pantalón Diario",
  camisa_diario: "Camisa Diaria",
  pantalon_ef: "Pantalón E.F.",
  sueter_ef: "Suéter E.F.",
};

const UTILIDADES_DEFAULT: Record<string, number> = {
  pantalon_diario: 20000,
  camisa_diario: 15000,
  pantalon_ef: 12000,
  sueter_ef: 11000,
};

const NOMBRES_INSUMOS: Record<string, string> = {
  drill: "Tela Drill",
  popelina: "Tela Popelina",
  licra: "Tela Licra",
  hilo: "Hilo",
  botones: "Botones",
};

const COLORES_PRENDA = ["#2563EB", "#7C3AED", "#059669", "#D97706"];

const TALLAS = ["XS", "S", "M", "L", "XL", "06-08", "10-12", "14-16", "UNICA"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function colorEstado(estado: string) {
  if (estado === "OPTIMAL") return { bg: "#DCFCE7", text: "#166534", icon: <CheckCircle size={16} /> };
  if (estado === "INFEASIBLE") return { bg: "#FEF3C7", text: "#92400E", icon: <AlertTriangle size={16} /> };
  return { bg: "#FEE2E2", text: "#991B1B", icon: <XCircle size={16} /> };
}

function colorUtilizacion(pct: number) {
  if (pct >= 95) return "#EF4444";
  if (pct >= 75) return "#F59E0B";
  return "#10B981";
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function OptimizacionPage() {
  const {
    resultado,
    historial,
    loading,
    loadingHistorial,
    error,
    online,
    ejecutar,
    cargarHistorial,
    checkStatus,
  } = useOptimizacion();

  const [talla, setTalla] = useState("M");
  const [incluirDemanda, setIncluirDemanda] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<"resultado" | "historial">("resultado");

  useEffect(() => {
    checkStatus();
    cargarHistorial();
  }, [checkStatus, cargarHistorial]);

  const handleEjecutar = async () => {
    const res = await ejecutar(talla, incluirDemanda);
    if (res) {
      setVistaActiva("resultado");
      cargarHistorial();
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* ── Encabezado ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <TrendingUp size={22} color="white" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
              Optimización de Producción
            </h1>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              Programación Lineal Entera — maximiza utilidad con stock disponible
            </p>
          </div>
        </div>

        {/* Estado del servicio */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", borderRadius: 20, flexShrink: 0,
            background: online === true ? "#DCFCE7" : online === false ? "#FEE2E2" : "#F3F4F6",
            color: online === true ? "#166534" : online === false ? "#991B1B" : "#6B7280",
            fontSize: 13, fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: online === true ? "#16A34A" : online === false ? "#DC2626" : "#9CA3AF",
            }}
          />
          {online === true ? "Servicio activo" : online === false ? "Servicio inactivo" : "Verificando…"}
        </div>
      </div>

      {/* ── Panel de configuración ── */}
      <div
        style={{
          background: "white", borderRadius: 16, border: "1px solid #E5E7EB",
          padding: "20px", marginBottom: "20px",
          display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            TALLA A OPTIMIZAR
          </label>
          <select
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
            style={{
              padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB",
              fontSize: 14, color: "#111827", background: "white", cursor: "pointer",
            }}
          >
            {TALLAS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: 4 }}>
          <input
            type="checkbox"
            id="incluirDemanda"
            checked={incluirDemanda}
            onChange={(e) => setIncluirDemanda(e.target.checked)}
            style={{ width: 16, height: 16, cursor: "pointer" }}
          />
          <label htmlFor="incluirDemanda" style={{ fontSize: 14, color: "#374151", cursor: "pointer" }}>
            Incluir restricciones de demanda
          </label>
        </div>

        <button
          onClick={handleEjecutar}
          disabled={loading || online === false}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: 10,
            background: loading || online === false ? "#9CA3AF" : "linear-gradient(135deg, #2563EB, #7C3AED)",
            color: "white", border: "none", fontWeight: 600, fontSize: 14,
            cursor: loading || online === false ? "not-allowed" : "pointer",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? (
            <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Play size={16} fill="white" />
          )}
          {loading ? "Resolviendo…" : "Ejecutar optimización"}
        </button>

        <div
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: 12, color: "#9CA3AF",
          }}
        >
          <Info size={14} />
          PuLP + CBC (COIN-BC)
        </div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
              padding: "12px 16px", marginBottom: 16, color: "#991B1B",
              display: "flex", alignItems: "center", gap: "8px", fontSize: 14,
            }}
          >
            <XCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
        {(["resultado", "historial"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setVistaActiva(tab)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: vistaActiva === tab ? "#2563EB" : "#F3F4F6",
              color: vistaActiva === tab ? "white" : "#6B7280",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab === "resultado" ? "Resultado" : "Historial"}
          </button>
        ))}
      </div>

      {/* ── Vista resultado ── */}
      {vistaActiva === "resultado" && (
        <AnimatePresence mode="wait">
          {resultado ? (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResultadoPanel resultado={resultado} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center", padding: "48px 16px",
                background: "white", borderRadius: 16, border: "1px solid #E5E7EB",
              }}
            >
              <TrendingUp size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
              <p style={{ color: "#9CA3AF", fontSize: 15, margin: 0 }}>
                Configura los parámetros y ejecuta la optimización para ver el plan de producción.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Vista historial ── */}
      {vistaActiva === "historial" && (
        <HistorialPanel
          historial={historial?.items ?? []}
          loading={loadingHistorial}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Panel de resultado ────────────────────────────────────────────────────────
function ResultadoPanel({ resultado }: { resultado: OptimizacionResponse }) {
  const estadoColor = colorEstado(resultado.estado);
  const plan = resultado.plan;
  const planKeys = Object.keys(NOMBRES_PRENDAS) as (keyof typeof plan)[];
  const totalPrendas = planKeys.reduce((s, k) => s + (plan[k] as number), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Estado y utilidad */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <KpiCard
          label="Estado"
          value={resultado.estado}
          icon={estadoColor.icon}
          bg={estadoColor.bg}
          color={estadoColor.text}
        />
        <KpiCard
          label="Utilidad máxima"
          value={formatCOP(resultado.utilidad_total)}
          icon={<TrendingUp size={18} />}
          bg="#EFF6FF"
          color="#1D4ED8"
        />
        <KpiCard
          label="Total prendas"
          value={`${totalPrendas} uds.`}
          icon={<CheckCircle size={18} />}
          bg="#F0FDF4"
          color="#166534"
        />
        <KpiCard
          label="Talla"
          value={resultado.talla}
          icon={<Info size={18} />}
          bg="#FAF5FF"
          color="#6D28D9"
        />
      </div>

      {/* Mensaje */}
      <div
        style={{
          background: "#F9FAFB", borderRadius: 10, padding: "12px 16px",
          border: "1px solid #E5E7EB", fontSize: 14, color: "#374151",
        }}
      >
        {resultado.mensaje}
      </div>

      {/* Plan de producción */}
      <div
        style={{
          background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px",
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
          Plan de producción
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {planKeys.map((key, i) => {
            const qty = plan[key] as number;
            const utilidad = (UTILIDADES_DEFAULT[key] ?? 0) * qty;
            return (
              <div
                key={key}
                style={{
                  flex: "1 1 180px", borderRadius: 12,
                  border: `2px solid ${COLORES_PRENDA[i]}20`,
                  background: `${COLORES_PRENDA[i]}08`,
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: COLORES_PRENDA[i], marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
                  {NOMBRES_PRENDAS[key]}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>
                  {qty}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  {formatCOP(utilidad)} utilidad
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recursos */}
      {Object.keys(resultado.recursos).length > 0 && (
        <div
          style={{
            background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
            Utilización de insumos
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(resultado.recursos).map(([key, rec]) => {
              const pct = rec.utilizacion_pct;
              const color = colorUtilizacion(pct);
              return (
                <div key={key}>
                  <div
                    style={{
                      display: "flex", justifyContent: "space-between",
                      marginBottom: 6, fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      {NOMBRES_INSUMOS[key] ?? key}
                    </span>
                    <span style={{ color: "#6B7280" }}>
                      {rec.usado} / {rec.disponible} &nbsp;
                      <span style={{ color, fontWeight: 700 }}>{pct.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8, borderRadius: 4, background: "#F3F4F6", overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ height: "100%", background: color, borderRadius: 4 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Demanda */}
      {Object.keys(resultado.demanda).length > 0 && (
        <div
          style={{
            background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
            Restricciones de demanda
          </h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(resultado.demanda).map(([key, dem]) => (
              <div
                key={key}
                style={{
                  flex: "1 1 160px", borderRadius: 10, padding: "12px",
                  background: "#F9FAFB", border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>
                  {NOMBRES_PRENDAS[key] ?? key}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
                  {dem.solicitado}
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  de {dem.demanda_maxima} demandadas
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficas + botón PDF */}
      {(resultado.grafica_html || resultado.grafica_region_html) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Header con botón PDF */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
              Análisis gráfico
            </h3>
            {resultado.id && <BotonDescargaPdf historialId={resultado.id} />}
          </div>

          {/* Gráfica 1: Plotly interactivo */}
          {resultado.grafica_html && (
            <div
              style={{
                background: "white", borderRadius: 16, border: "1px solid #E5E7EB",
                padding: "20px", overflow: "hidden",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>
                Plan de producción — Utilización de insumos
              </p>
              <iframe
                srcDoc={resultado.grafica_html}
                className="w-full h-[260px] sm:h-[380px] lg:h-[420px] rounded-lg border-none"
                title="Gráfica de optimización"
                sandbox="allow-scripts"
              />
            </div>
          )}

          {/* Gráfica 2: Región factible (método gráfico PL) */}
          {resultado.grafica_region_html && (
            <div
              style={{
                background: "white", borderRadius: 16, border: "1px solid #E5E7EB",
                padding: "20px", overflow: "hidden",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
                Región Factible — Método Gráfico PL
              </p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 12px" }}>
                Proyección bidimensional (x₁ = Pantalón Diario, x₂ = Camisa Diaria).
                Área azul = región factible · Punto rojo = solución óptima.
              </p>
              <iframe
                srcDoc={resultado.grafica_region_html}
                className="w-full h-[300px] sm:h-[440px] lg:h-[520px] rounded-lg border-none"
                title="Región factible"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel historial ───────────────────────────────────────────────────────────
function HistorialPanel({
  historial,
  loading,
}: {
  historial: HistorialItem[];
  loading: boolean;
}) {
  const [expandido, setExpandido] = useState<number | null>(null);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
        <RefreshCw size={28} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div
        style={{
          textAlign: "center", padding: "60px 24px",
          background: "white", borderRadius: 16, border: "1px solid #E5E7EB",
        }}
      >
        <Clock size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
        <p style={{ color: "#9CA3AF", fontSize: 15 }}>
          Aún no hay ejecuciones registradas.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {historial.map((item) => {
        const { bg, text, icon } = colorEstado(item.estado_solucion);
        const isOpen = expandido === item.id;
        return (
          <div
            key={item.id}
            style={{
              background: "white", borderRadius: 12,
              border: "1px solid #E5E7EB", overflow: "hidden",
            }}
          >
            <button
              onClick={() => setExpandido(isOpen ? null : item.id)}
              className="w-full text-left"
              style={{
                padding: "12px 16px", border: "none",
                background: "transparent", cursor: "pointer",
              }}
            >
              {/* Fila superior: badge + talla + utilidad + chevron */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "3px 10px", borderRadius: 20,
                    background: bg, color: text, fontSize: 12, fontWeight: 600, flexShrink: 0,
                  }}
                >
                  {icon} {item.estado_solucion}
                </span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                  Talla {item.talla}
                </span>
                {item.utilidad_total != null && (
                  <span style={{ fontSize: 13, color: "#2563EB", fontWeight: 600 }}>
                    {formatCOP(item.utilidad_total)}
                  </span>
                )}
                <ChevronDown
                  size={16}
                  color="#9CA3AF"
                  style={{ marginLeft: "auto", transform: isOpen ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }}
                />
              </div>
              {/* Fila inferior: fecha + botón PDF */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {item.fecha_ejecucion ? formatDate(item.fecha_ejecucion) : "—"}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); optimizacionService.downloadPdf(item.id).catch(() => alert("Error PDF")); }}
                  title="Descargar PDF"
                  style={{
                    display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px",
                    borderRadius: 6, border: "1px solid #E5E7EB",
                    background: "white", cursor: "pointer", color: "#1D4ED8", fontSize: 12,
                  }}
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            </button>

            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  borderTop: "1px solid #F3F4F6", padding: "12px 16px",
                  background: "#F9FAFB",
                }}
              >
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: 13 }}>
                  {[
                    { label: "Pantalón Diario", val: item.x1_pantalon_diario },
                    { label: "Camisa Diaria",   val: item.x2_camisa_diario },
                    { label: "Pantalón E.F.",   val: item.x3_pantalon_ef },
                    { label: "Suéter E.F.",     val: item.x4_sueter_ef },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <span style={{ color: "#9CA3AF" }}>{label}: </span>
                      <span style={{ fontWeight: 700, color: "#111827" }}>{val ?? 0}</span>
                    </div>
                  ))}
                </div>
                {item.mensaje && (
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6B7280" }}>
                    {item.mensaje}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Botón descarga PDF ────────────────────────────────────────────────────────
function BotonDescargaPdf({ historialId }: { historialId: number }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await optimizacionService.downloadPdf(historialId);
    } catch {
      alert("Error al generar el PDF. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 16px", borderRadius: 8,
        background: loading ? "#9CA3AF" : "#1D4ED8",
        color: "white", border: "none",
        fontWeight: 600, fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {loading
        ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
        : <Download size={14} />}
      {loading ? "Generando..." : "Descargar PDF"}
    </button>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon, bg, color,
}: {
  label: string; value: string; icon: React.ReactNode; bg: string; color: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 160px", borderRadius: 12, padding: "16px",
        background: bg, border: `1px solid ${color}30`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

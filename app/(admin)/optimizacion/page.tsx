"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Play, Clock, ChevronDown, CheckCircle, XCircle,
  AlertTriangle, Info, RefreshCw, Download, School,
  Package, ListChecks, Banknote,
} from "lucide-react";
import { useOptimizacion } from "@/app/hooks/useOptimizacion";
import { optimizacionService } from "@/app/services/optimizacion.service";
import { colegiosService } from "@/app/services/colegios.service";
import type { ColegioResponse } from "@/app/types/colegio";
import type { HistorialItem, OptimizacionResponse } from "@/app/types/optimizacion";

// ── Utilidades por clave canónica (para mostrar el valor monetario en las tarjetas)
const UTILIDADES_CONOCIDAS: Record<string, number> = {
  pantalon_diario:           20_000,
  camisa_diario:             15_000,
  sueter_diario:             13_000,
  pantalon_ef:               12_000,
  sueter_ef:                 11_000,
  pantalon_educacion_fisica: 12_000,
  sueter_educacion_fisica:   11_000,
  camisa_educacion_fisica:   13_000,
  blusa_diario:              15_000,
  bata_diario:               14_000,
  falda_diario:              13_000,
};

const NOMBRES_INSUMOS: Record<string, string> = {
  drill: "Tela Drill", popelina: "Tela Popelina", licra: "Tela Licra",
  lana: "Tela Lana", hilo: "Hilo", botones: "Botones",
  entretela: "Entretela", cierres: "Cierres", elastico: "Elástico",
  cinta: "Cinta", etiquetas: "Etiquetas",
};

const COLORES_PRENDA = ["#2563EB", "#7C3AED", "#EC4899", "#059669", "#D97706",
                        "#0891B2", "#DC2626", "#16A34A", "#9333EA", "#EA580C"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function labelPrenda(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function colorEstado(estado: string) {
  if (estado === "OPTIMAL")    return { bg: "#DCFCE7", text: "#166534", icon: <CheckCircle size={16} /> };
  if (estado === "INFEASIBLE") return { bg: "#FEF3C7", text: "#92400E", icon: <AlertTriangle size={16} /> };
  return { bg: "#FEE2E2", text: "#991B1B", icon: <XCircle size={16} /> };
}

function colorUtilizacion(pct: number) {
  if (pct >= 95) return "#EF4444";
  if (pct >= 75) return "#F59E0B";
  return "#10B981";
}

function formatCOP(v: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function badgeGenero(genero: string | null | undefined): { label: string; bg: string; color: string } | null {
  if (!genero) return null;
  const g = genero.toLowerCase();
  if (g === "masculino" || g === "hombre") return { label: "Masculino", bg: "#DBEAFE", color: "#1D4ED8" };
  if (g === "femenino"  || g === "mujer")  return { label: "Femenino",  bg: "#FCE7F3", color: "#BE185D" };
  if (g === "unisex")                      return { label: "Unisex",    bg: "#F3F4F6", color: "#6B7280" };
  return { label: genero, bg: "#F3F4F6", color: "#6B7280" };
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function OptimizacionPage() {
  const { resultado, historial, loading, loadingHistorial, error, online, ejecutar, cargarHistorial, checkStatus } = useOptimizacion();

  const [incluirDemanda,  setIncluirDemanda]  = useState(true);
  const [vistaActiva,     setVistaActiva]     = useState<"resultado" | "historial">("resultado");
  const [colegios,        setColegios]        = useState<ColegioResponse[]>([]);
  const [colegioId,       setColegioId]       = useState<number | null>(null);
  const [loadingColegios, setLoadingColegios] = useState(false);

  useEffect(() => {
    checkStatus();
    // Cargar todos los colegios para el selector
    setLoadingColegios(true);
    colegiosService.listar({ size: 100, sortBy: "nombre" })
      .then((p) => setColegios(p.content ?? []))
      .catch(() => setColegios([]))
      .finally(() => setLoadingColegios(false));
  }, [checkStatus]);

  // Recargar historial cuando cambie el colegio seleccionado
  useEffect(() => {
    cargarHistorial(20, colegioId ?? undefined);
  }, [cargarHistorial, colegioId]);

  const handleEjecutar = async () => {
    if (!colegioId) return;
    const res = await ejecutar(colegioId, incluirDemanda);
    if (res) {
      setVistaActiva("resultado");
      cargarHistorial(20, colegioId);
    }
  };

  const colegioSeleccionado = colegios.find((c) => c.id === colegioId);
  const puedeEjecutar = !!colegioId && !loading && online !== false;
  const [infoProbAbierta, setInfoProbAbierta] = useState(true);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* ── Encabezado ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: 20, flexShrink: 0, background: online === true ? "#DCFCE7" : online === false ? "#FEE2E2" : "#F3F4F6", color: online === true ? "#166534" : online === false ? "#991B1B" : "#6B7280", fontSize: 13, fontWeight: 500 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: online === true ? "#16A34A" : online === false ? "#DC2626" : "#9CA3AF" }} />
          {online === true ? "Servicio activo" : online === false ? "Servicio inactivo" : "Verificando…"}
        </div>
      </div>

      {/* ── Problema de optimización ── */}
      <div style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #FAF5FF 100%)", borderRadius: 16, border: "1px solid #BFDBFE", marginBottom: "20px", overflow: "hidden" }}>
        <button
          onClick={() => setInfoProbAbierta((v) => !v)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #0891B2, #0D9488)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Info size={16} color="white" />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1E3A8A" }}>¿Qué problema resuelve este módulo?</div>
              <div style={{ fontSize: 12, color: "#3B82F6" }}>Modelo de Programación Lineal Entera Mixta (ILP)</div>
            </div>
          </div>
          <ChevronDown size={18} color="#3B82F6" style={{ transform: infoProbAbierta ? "rotate(180deg)" : "none", transition: "transform 0.25s" }} />
        </button>

        <AnimatePresence initial={false}>
          {infoProbAbierta && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 20px 20px" }}>
                {/* Pregunta problema */}
                <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: "1px solid #DBEAFE" }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#1E40AF", fontWeight: 600, lineHeight: 1.6 }}>
                    ¿Cuántas unidades de cada prenda del uniforme debo confeccionar esta semana
                    para <span style={{ color: "#7C3AED" }}>maximizar la utilidad económica del taller</span>,
                    sin superar el stock real de insumos disponibles ni exceder los pedidos activos del colegio?
                  </p>
                </div>

                {/* Tres pilares */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: 16 }}>
                  {[
                    {
                      icon: <Package size={18} color="#1D4ED8" strokeWidth={2} />,
                      titulo: "Restricción de insumos",
                      desc: "El modelo respeta el stock real del taller. Nunca asignará más material del que hay disponible, aunque sea compartido entre colegios.",
                      bg: "#EFF6FF", border: "#BFDBFE", iconBg: "#DBEAFE", title: "#1D4ED8",
                    },
                    {
                      icon: <ListChecks size={18} color="#6D28D9" strokeWidth={2} />,
                      titulo: "Restricción de demanda",
                      desc: "Si se activa, el plan no supera la cantidad solicitada en pedidos activos. Evita sobreproducir prendas que nadie ha pedido aún.",
                      bg: "#FAF5FF", border: "#DDD6FE", iconBg: "#EDE9FE", title: "#6D28D9",
                    },
                    {
                      icon: <Banknote size={18} color="#166534" strokeWidth={2} />,
                      titulo: "Función objetivo",
                      desc: "Se maximiza la suma de utilidades: cada prenda tiene un valor en COP. El solver encuentra la combinación que genera más ganancia posible.",
                      bg: "#F0FDF4", border: "#BBF7D0", iconBg: "#DCFCE7", title: "#166534",
                    },
                  ].map(({ icon, titulo, desc, bg, border, iconBg, title }) => (
                    <div key={titulo} style={{ flex: "1 1 200px", background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "14px" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                        {icon}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: title, marginBottom: 4 }}>{titulo}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  ))}
                </div>

                {/* Resultado esperado */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "white", borderRadius: 10, border: "1px solid #E5E7EB" }}>
                  <CheckCircle size={18} color="#16A34A" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
                    <strong>Al ejecutar obtendrás:</strong> el plan exacto de cuántas prendas confeccionar por género y tipo, la utilidad máxima alcanzable, el uso de cada insumo y —si alguna prenda no puede producirse— la razón exacta con el insumo que lo limita.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Panel de configuración ── */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px", marginBottom: "20px" }}>
        {/* Selector de colegio */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
            <School size={15} color="#2563EB" />
            Colegio a optimizar
          </label>
          <select
            value={colegioId ?? ""}
            onChange={(e) => setColegioId(e.target.value ? Number(e.target.value) : null)}
            disabled={loadingColegios}
            style={{ width: "100%", maxWidth: 420, padding: "10px 14px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 14, color: colegioId ? "#111827" : "#9CA3AF", background: "white", cursor: "pointer", outline: "none" }}
          >
            <option value="">
              {loadingColegios ? "Cargando colegios…" : "— Selecciona un colegio —"}
            </option>
            {colegios.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {!colegioId && (
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#F59E0B" }}>
              Debes seleccionar un colegio para ejecutar la optimización.
            </p>
          )}
        </div>

        {/* Checkbox + botón */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" id="incluirDemanda" checked={incluirDemanda} onChange={(e) => setIncluirDemanda(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="incluirDemanda" style={{ fontSize: 14, color: "#374151", cursor: "pointer" }}>
              Incluir restricciones de demanda
            </label>
          </div>

          <button
            onClick={handleEjecutar}
            disabled={!puedeEjecutar}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: 10, background: puedeEjecutar ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "#9CA3AF", color: "white", border: "none", fontWeight: 600, fontSize: 14, cursor: puedeEjecutar ? "pointer" : "not-allowed", transition: "opacity 0.2s" }}
          >
            {loading ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={16} fill="white" />}
            {loading ? "Resolviendo…" : "Ejecutar optimización"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 12, color: "#9CA3AF" }}>
            <Info size={14} />
            PuLP + CBC (COIN-BC)
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#991B1B", display: "flex", alignItems: "center", gap: "8px", fontSize: 14 }}>
            <XCircle size={16} />{error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
        {(["resultado", "historial"] as const).map((tab) => (
          <button key={tab} onClick={() => setVistaActiva(tab)}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: vistaActiva === tab ? "#2563EB" : "#F3F4F6", color: vistaActiva === tab ? "white" : "#6B7280", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
            {tab === "resultado" ? "Resultado" : "Historial"}
          </button>
        ))}
      </div>

      {/* ── Vista resultado ── */}
      {vistaActiva === "resultado" && (
        <AnimatePresence mode="wait">
          {resultado ? (
            <motion.div key="resultado" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ResultadoPanel resultado={resultado} />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "48px 16px", background: "white", borderRadius: 16, border: "1px solid #E5E7EB" }}>
              <TrendingUp size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
              <p style={{ color: "#9CA3AF", fontSize: 15, margin: 0 }}>
                {colegioId
                  ? `Seleccionado: ${colegioSeleccionado?.nombre ?? ""}. Ejecuta la optimización para ver el plan.`
                  : "Selecciona un colegio y ejecuta la optimización para ver el plan de producción."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Vista historial ── */}
      {vistaActiva === "historial" && (
        <HistorialPanel historial={historial?.items ?? []} loading={loadingHistorial} />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Modal de información por prenda ──────────────────────────────────────────
function InfoModal({
  varKey, resultado, onClose,
}: {
  varKey: string;
  resultado: OptimizacionResponse;
  onClose: () => void;
}) {
  const detalle    = resultado.detalle_plan?.[varKey];
  const qty        = resultado.plan[varKey] ?? 0;
  const esZero     = qty === 0;
  const nombre     = labelPrenda(varKey);
  const utilidad   = (UTILIDADES_CONOCIDAS[varKey] ?? 10_000) * qty;
  const insNombre  = detalle?.insumo_limitante_nombre ?? detalle?.insumo_limitante_key ?? "—";
  const insKey     = detalle?.insumo_limitante_key;
  const unidad     = insKey ? (resultado.recursos[insKey]?.unidad_medida || "un") : "un";
  const eficiencia = detalle?.eficiencia_cop_por_unidad;
  const coef       = detalle?.coef_insumo_limitante;

  // Clasifica la eficiencia relativa comparando contra todas las prendas del plan
  const todasEficiencias = Object.values(resultado.detalle_plan ?? {})
    .map(d => d.eficiencia_cop_por_unidad)
    .filter((e): e is number => e != null);
  const maxEf = Math.max(...todasEficiencias, 1);
  const nivelEf = eficiencia == null ? null
    : eficiencia >= maxEf * 0.75 ? "alta"
    : eficiencia >= maxEf * 0.40 ? "media"
    : "baja";
  const nivelColor = nivelEf === "alta" ? "#16A34A" : nivelEf === "media" ? "#D97706" : "#DC2626";
  const nivelLabel = nivelEf === "alta" ? "Alta prioridad" : nivelEf === "media" ? "Prioridad media" : "Baja prioridad";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: 16, padding: "24px", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", border: "1px solid #E5E7EB" }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Detalle de prenda</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{nombre}</span>
              {(() => { const bg = badgeGenero(detalle?.genero); return bg ? (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: bg.bg, color: bg.color }}>
                  {bg.label}
                </span>
              ) : null; })()}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}>✕</button>
        </div>

        {/* Estado */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: 10, marginBottom: 16, background: esZero ? "#FEF3C7" : "#F0FDF4", border: `1px solid ${esZero ? "#FDE68A" : "#BBF7D0"}` }}>
          {esZero
            ? <AlertTriangle size={18} color="#D97706" strokeWidth={2.2} />
            : <CheckCircle  size={18} color="#16A34A" strokeWidth={2.2} />}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: esZero ? "#92400E" : "#166534" }}>
              {esZero ? "No producida" : `${qty} unidades a producir`}
            </div>
            <div style={{ fontSize: 12, color: esZero ? "#B45309" : "#15803D" }}>{detalle?.motivo}</div>
          </div>
        </div>

        {/* Filas de datos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: 13 }}>
          {!esZero && (
            <Row label="Utilidad aportada" value={formatCOP(utilidad)} valueColor="#1D4ED8" bold />
          )}

          {insNombre !== "—" && (
            <Row label="Insumo limitante" value={insNombre} />
          )}

          {coef != null && (
            <Row label="Consumo por prenda" value={`${coef} ${unidad}/prenda`} />
          )}

          {eficiencia != null && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6B7280" }}>Eficiencia del insumo</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 700, color: "#111827" }}>{formatCOP(eficiencia)}/{unidad}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: nivelColor + "18", color: nivelColor }}>
                  {nivelLabel}
                </span>
              </div>
            </div>
          )}

          {esZero && detalle?.max_producible != null && (
            <Row
              label="Máx. adicional posible"
              value={detalle.max_producible > 0 ? `${detalle.max_producible} uds. (stock insuficiente)` : "0 uds. — insumo agotado"}
            />
          )}
        </div>

        {/* Explicación contextual */}
        <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #F3F4F6", fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
          {esZero ? (
            nivelEf === "baja"
              ? `El solver priorizó otras prendas que generan más utilidad por cada ${unidad} de "${insNombre}" disponible. Para producir esta prenda, se necesitaría más stock de ese insumo.`
              : `No queda stock de "${insNombre}" después de asignarlo al plan óptimo.`
          ) : (
            eficiencia != null && nivelEf === "alta"
              ? `Esta prenda tiene alta eficiencia: genera ${formatCOP(eficiencia)} por cada ${unidad} de "${insNombre}" consumido, lo que la hace prioritaria en el plan.`
              : `Incluida en el plan porque su combinación de utilidad y consumo de insumos es favorable dentro del modelo.`
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#6B7280" }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: valueColor ?? "#111827" }}>{value}</span>
    </div>
  );
}

// ── Panel de resultado ────────────────────────────────────────────────────────
function ResultadoPanel({ resultado }: { resultado: OptimizacionResponse }) {
  const estadoColor = colorEstado(resultado.estado);
  const planEntries = Object.entries(resultado.plan);
  const totalPrendas = planEntries.reduce((s, [, qty]) => s + qty, 0);
  const [infoKey, setInfoKey] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Modal info */}
      <AnimatePresence>
        {infoKey && (
          <InfoModal varKey={infoKey} resultado={resultado} onClose={() => setInfoKey(null)} />
        )}
      </AnimatePresence>

      {/* Colegio badge */}
      {resultado.nombre_colegio && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "#EFF6FF", borderRadius: 10, border: "1px solid #BFDBFE" }}>
          <School size={16} color="#2563EB" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1D4ED8" }}>{resultado.nombre_colegio}</span>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <KpiCard label="Estado" value={resultado.estado} icon={estadoColor.icon} bg={estadoColor.bg} color={estadoColor.text} />
        <KpiCard label="Utilidad máxima" value={formatCOP(resultado.utilidad_total)} icon={<TrendingUp size={18} />} bg="#EFF6FF" color="#1D4ED8" />
        <KpiCard label="Total prendas" value={`${totalPrendas} uds.`} icon={<CheckCircle size={18} />} bg="#F0FDF4" color="#166534" />
        <KpiCard label="Tipos de prenda" value={`${planEntries.length} tipos`} icon={<Info size={18} />} bg="#FAF5FF" color="#6D28D9" />
      </div>

      {/* Mensaje */}
      <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 16px", border: "1px solid #E5E7EB", fontSize: 14, color: "#374151" }}>
        {resultado.mensaje}
      </div>

      {/* Plan de producción — dinámico */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Plan de producción</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {planEntries.map(([key, qty], i) => {
            const esZero   = qty === 0;
            const detalle  = resultado.detalle_plan?.[key];
            const utilidad = (UTILIDADES_CONOCIDAS[key] ?? 10_000) * qty;
            const color    = esZero ? "#F59E0B" : COLORES_PRENDA[i % COLORES_PRENDA.length];

            return (
              <div key={key} style={{ flex: "1 1 180px", borderRadius: 12, border: `2px solid ${esZero ? "#FEF3C7" : color + "20"}`, background: esZero ? "#FFFBEB" : `${color}08`, padding: "16px", position: "relative" }}>
                {/* Botón info */}
                <button
                  onClick={() => setInfoKey(key)}
                  title="Ver detalle"
                  style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", border: `1px solid ${color}40`, background: `${color}15`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 12, fontWeight: 700, lineHeight: 1 }}
                >
                  i
                </button>

                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4, paddingRight: 28 }}>{labelPrenda(key)}</div>
                {(() => { const bg = badgeGenero(detalle?.genero); return bg ? (
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: bg.bg, color: bg.color, marginBottom: 6, letterSpacing: 0.3 }}>
                    {bg.label}
                  </span>
                ) : null; })()}
                <div style={{ fontSize: 28, fontWeight: 800, color: esZero ? "#D97706" : "#111827" }}>{qty}</div>

                {/* Badge motivo (solo si qty=0) */}
                {esZero && detalle && (
                  <div style={{ fontSize: 11, color: "#92400E", marginTop: 6, padding: "4px 8px", background: "#FEF3C7", borderRadius: 6, lineHeight: 1.4 }}>
                    ⚠ {detalle.motivo}
                  </div>
                )}

                {/* Utilidad (solo si qty>0) */}
                {!esZero && (
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{formatCOP(utilidad)} utilidad</div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Recursos */}
      {Object.keys(resultado.recursos).length > 0 && (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Utilización de insumos</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(resultado.recursos).map(([key, rec]) => {
              const pct = rec.utilizacion_pct;
              const color = colorUtilizacion(pct);
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      {resultado.insumo_labels?.[key] ?? NOMBRES_INSUMOS[key] ?? key}
                    </span>
                    <span style={{ color: "#6B7280" }}>
                      {rec.usado} / {rec.disponible}
                      {rec.unidad_medida && <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 3 }}>{rec.unidad_medida}</span>}
                      &nbsp;&nbsp;<span style={{ color, fontWeight: 700 }}>{pct.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "#F3F4F6", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ height: "100%", background: color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Demanda */}
      {Object.keys(resultado.demanda).length > 0 && (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Restricciones de demanda</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(resultado.demanda).map(([key, dem]) => (
              <div key={key} style={{ flex: "1 1 160px", borderRadius: 10, padding: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>{labelPrenda(key)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{dem.solicitado}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>de {dem.demanda_maxima} demandadas</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficas */}
      {(resultado.grafica_html || resultado.grafica_region_html) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Análisis gráfico</h3>
            {resultado.id && <BotonDescargaPdf historialId={resultado.id} />}
          </div>
          {resultado.grafica_html && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px", overflow: "hidden" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>Plan de producción — Utilización de insumos</p>
              <iframe srcDoc={resultado.grafica_html} className="w-full h-[260px] sm:h-[380px] lg:h-[420px] rounded-lg border-none" title="Gráfica de optimización" sandbox="allow-scripts" />
            </div>
          )}
          {resultado.grafica_region_html && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px", overflow: "hidden" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Región Factible — Método Gráfico PL</p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 12px" }}>
                Proyección bidimensional sobre las 2 principales prendas del colegio. Área azul = región factible · Punto rojo = solución óptima.
              </p>
              <iframe srcDoc={resultado.grafica_region_html} className="w-full h-[300px] sm:h-[440px] lg:h-[520px] rounded-lg border-none" title="Región factible" sandbox="allow-scripts" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel historial ───────────────────────────────────────────────────────────
function HistorialPanel({ historial, loading }: { historial: HistorialItem[]; loading: boolean }) {
  const [expandido, setExpandido] = useState<number | null>(null);

  if (loading) return <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}><RefreshCw size={28} style={{ animation: "spin 1s linear infinite" }} /></div>;

  if (historial.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 16, border: "1px solid #E5E7EB" }}>
      <Clock size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
      <p style={{ color: "#9CA3AF", fontSize: 15 }}>Aún no hay ejecuciones registradas para este colegio.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {historial.map((item) => {
        const { bg, text, icon } = colorEstado(item.estado_solucion);
        const isOpen = expandido === item.id;
        // Usa plan_produccion JSONB si existe, sino reconstruye de columnas legacy
        const planData: Record<string, number> = item.plan_produccion ?? {
          ...(item.x1_pantalon_diario ? { pantalon_diario: item.x1_pantalon_diario } : {}),
          ...(item.x2_camisa_diario   ? { camisa_diario:   item.x2_camisa_diario }   : {}),
          ...(item.x5_sueter_diario   ? { sueter_diario:   item.x5_sueter_diario }   : {}),
          ...(item.x3_pantalon_ef     ? { pantalon_ef:     item.x3_pantalon_ef }     : {}),
          ...(item.x4_sueter_ef       ? { sueter_ef:       item.x4_sueter_ef }       : {}),
        };

        return (
          <div key={item.id} style={{ background: "white", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <button onClick={() => setExpandido(isOpen ? null : item.id)} className="w-full text-left"
              style={{ padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: 20, background: bg, color: text, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  {icon} {item.estado_solucion}
                </span>
                {item.nombre_colegio && (
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{item.nombre_colegio}</span>
                )}
                {item.utilidad_total != null && (
                  <span style={{ fontSize: 13, color: "#2563EB", fontWeight: 600 }}>{formatCOP(item.utilidad_total)}</span>
                )}
                <ChevronDown size={16} color="#9CA3AF" style={{ marginLeft: "auto", transform: isOpen ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{item.fecha_ejecucion ? formatDate(item.fecha_ejecucion) : "—"}</span>
                <button onClick={(e) => { e.stopPropagation(); optimizacionService.downloadPdf(item.id).catch(() => alert("Error PDF")); }}
                  title="Descargar PDF"
                  style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: 6, border: "1px solid #E5E7EB", background: "white", cursor: "pointer", color: "#1D4ED8", fontSize: 12 }}>
                  <Download size={13} /> PDF
                </button>
              </div>
            </button>

            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }}
                style={{ borderTop: "1px solid #F3F4F6", padding: "12px 16px", background: "#F9FAFB" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: 13 }}>
                  {Object.entries(planData).filter(([, v]) => v > 0).map(([key, val]) => (
                    <div key={key}>
                      <span style={{ color: "#9CA3AF" }}>{labelPrenda(key)}: </span>
                      <span style={{ fontWeight: 700, color: "#111827" }}>{val}</span>
                    </div>
                  ))}
                </div>
                {item.mensaje && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6B7280" }}>{item.mensaje}</p>}
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
  return (
    <button onClick={async () => { setLoading(true); try { await optimizacionService.downloadPdf(historialId); } catch { alert("Error al generar el PDF."); } finally { setLoading(false); } }}
      disabled={loading}
      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: 8, background: loading ? "#9CA3AF" : "#1D4ED8", color: "white", border: "none", fontWeight: 600, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
      {loading ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
      {loading ? "Generando..." : "Descargar PDF"}
    </button>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, bg, color }: { label: string; value: string; icon: React.ReactNode; bg: string; color: string }) {
  return (
    <div style={{ flex: "1 1 160px", borderRadius: 12, padding: "16px", background: bg, border: `1px solid ${color}30` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color, marginBottom: 8 }}>
        {icon}<span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

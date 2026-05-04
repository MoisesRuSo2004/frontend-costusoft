"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Bot,
  BrainCircuit,
  ClipboardList,
  Copy,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  ShoppingCart,
  Sparkles,
  Trash2,
  TrendingUp,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { useIA } from "@/app/hooks/useIA";
import type { ChatMsg, OrdenCompraRequest, TipoConsulta } from "@/app/types/ia";

// ─── Config de tipos de análisis ─────────────────────────────────────────────

const TIPOS: {
  tipo: TipoConsulta;
  label: string;
  icon: typeof Bot;
  color: string;
  bg: string;
  desc: string;
}[] = [
  {
    tipo: "RESUMEN_INVENTARIO",
    label: "Resumen",
    icon: BarChart3,
    color: "#1d4ed8",
    bg: "#eff6ff",
    desc: "Estado general del inventario",
  },
  {
    tipo: "STOCK_BAJO",
    label: "Stock bajo",
    icon: AlertTriangle,
    color: "#dc2626",
    bg: "#fef2f2",
    desc: "Insumos por debajo del mínimo",
  },
  {
    tipo: "PEDIDOS_ACTIVOS",
    label: "Pedidos",
    icon: ShoppingCart,
    color: "#7c3aed",
    bg: "#f5f3ff",
    desc: "Pedidos activos y en producción",
  },
  {
    tipo: "ENTRADAS_PENDIENTES",
    label: "Entradas",
    icon: ArrowDownToLine,
    color: "#15803d",
    bg: "#f0fdf4",
    desc: "Entradas pendientes de confirmar",
  },
  {
    tipo: "SALIDAS_PENDIENTES",
    label: "Salidas",
    icon: ArrowUpFromLine,
    color: "#d97706",
    bg: "#fef3c7",
    desc: "Salidas pendientes de confirmar",
  },
  {
    tipo: "ANALISIS_GENERAL",
    label: "Análisis",
    icon: BrainCircuit,
    color: "#0891b2",
    bg: "#ecfeff",
    desc: "Diagnóstico completo del sistema",
  },
  {
    tipo: "PREDICCION_RIESGO",
    label: "Predicción",
    icon: TrendingUp,
    color: "#9333ea",
    bg: "#faf5ff",
    desc: "Predicciones ML de riesgo",
  },
  {
    tipo: "ANALISIS_PROVEEDORES",
    label: "Proveedores",
    icon: Truck,
    color: "#b45309",
    bg: "#fef3c7",
    desc: "Rendimiento de proveedores",
  },
  {
    tipo: "ANOMALIAS_CONSUMO",
    label: "Anomalías",
    icon: Activity,
    color: "#e11d48",
    bg: "#fff1f2",
    desc: "Picos y consumos inusuales",
  },
];

// ─── Markdown renderer ────────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} style={{ fontWeight: 700, color: "#101828" }}>
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function MarkdownText({
  text,
  color = "#344054",
}: {
  text: string;
  color?: string;
}) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul
        key={`ul-${nodes.length}`}
        style={{ paddingLeft: 18, margin: "6px 0", listStyleType: "disc" }}
      >
        {listBuffer.map((item, i) => (
          <li
            key={i}
            style={{
              color,
              fontSize: 13.5,
              lineHeight: 1.7,
              fontFamily: "var(--font-poppins), sans-serif",
              marginBottom: 2,
            }}
          >
            {parseInline(item)}
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  lines.forEach((line, i) => {
    if (line.startsWith("### ")) {
      flushList();
      nodes.push(
        <p
          key={i}
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#101828",
            margin: "10px 0 3px",
            letterSpacing: "0.02em",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {parseInline(line.slice(4))}
        </p>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      nodes.push(
        <p
          key={i}
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#101828",
            margin: "12px 0 4px",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {parseInline(line.slice(3))}
        </p>,
      );
    } else if (line.startsWith("# ")) {
      flushList();
      nodes.push(
        <p
          key={i}
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#101828",
            margin: "14px 0 4px",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {parseInline(line.slice(2))}
        </p>,
      );
    } else if (/^[-•*] /.test(line)) {
      listBuffer.push(line.replace(/^[-•*] /, ""));
    } else if (/^\d+\. /.test(line)) {
      listBuffer.push(line.replace(/^\d+\. /, ""));
    } else if (line.trim() === "") {
      flushList();
      nodes.push(<div key={i} style={{ height: 6 }} />);
    } else {
      flushList();
      nodes.push(
        <p
          key={i}
          style={{
            color,
            fontSize: 13.5,
            lineHeight: 1.75,
            margin: "2px 0",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {parseInline(line)}
        </p>,
      );
    }
  });
  flushList();

  return <div>{nodes}</div>;
}

// ─── Mensaje de usuario ───────────────────────────────────────────────────────

function UserBubble({ msg }: { msg: ChatMsg }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end"
    >
      <div
        className="max-w-[75%] rounded-3xl rounded-tr-lg px-4 py-3"
        style={{ backgroundColor: "#1d4ed8" }}
      >
        <MarkdownText text={msg.content} color="#ffffff" />
      </div>
    </motion.div>
  );
}

// ─── Respuesta de IA ──────────────────────────────────────────────────────────

function AIBubble({ msg }: { msg: ChatMsg }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-2xl mt-1"
        style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
      >
        <Bot size={14} style={{ color: "#ffffff" }} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Tipo badge */}
        {msg.tipo && (
          <div className="mb-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{
                backgroundColor: "#f0fdf4",
                color: "#15803d",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              <Sparkles size={9} />
              {msg.tipo}
            </span>
            {msg.isOrdenCompra && msg.insumosIncluidos != null && (
              <span
                className="text-[10px]"
                style={{
                  color: "#9ca3af",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {msg.insumosIncluidos} insumo
                {msg.insumosIncluidos !== 1 ? "s" : ""} incluido
                {msg.insumosIncluidos !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Contenido */}
        <div
          className="rounded-3xl rounded-tl-lg border p-4"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
          }}
        >
          <MarkdownText text={msg.content} />
        </div>

        {/* Meta footer */}
        {(msg.modelo || msg.tiempoMs) && (
          <div className="mt-1.5 flex items-center gap-3 px-1">
            {msg.modelo && (
              <span
                className="text-[10px]"
                style={{
                  color: "#d1d5db",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {msg.modelo}
              </span>
            )}
            {msg.tokensUsados && (
              <span
                className="text-[10px]"
                style={{
                  color: "#d1d5db",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {msg.tokensUsados} tokens
              </span>
            )}
            {msg.tiempoMs && (
              <span
                className="text-[10px]"
                style={{
                  color: "#d1d5db",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {(msg.tiempoMs / 1000).toFixed(1)}s
              </span>
            )}
            <button
              type="button"
              onClick={copy}
              className="ml-auto flex items-center gap-1 text-[10px] transition"
              style={{
                color: copied ? "#15803d" : "#d1d5db",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              <Copy size={10} />
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Mensaje de bienvenida ────────────────────────────────────────────────────

function WelcomeBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-3"
    >
      <div
        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-2xl mt-1"
        style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
      >
        <Bot size={14} style={{ color: "#ffffff" }} />
      </div>
      <div
        className="rounded-3xl rounded-tl-lg border p-4 flex-1"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
        }}
      >
        <p
          className="text-sm font-semibold mb-1"
          style={{
            color: "#101828",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Hola, soy el asistente IA de CostuSoft
        </p>
        <p
          className="text-[13px]"
          style={{
            color: "#667085",
            fontFamily: "var(--font-poppins), sans-serif",
            lineHeight: 1.7,
          }}
        >
          Análisis de inventario en tiempo real con Groq LLaMA 3.3. Usa los
          análisis rápidos de arriba o escríbeme directamente.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Indicador de escritura ───────────────────────────────────────────────────

function TypingIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3"
    >
      <div
        className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-2xl"
        style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
      >
        <Loader2
          size={14}
          className="animate-spin"
          style={{ color: "#ffffff" }}
        />
      </div>
      <div
        className="rounded-3xl rounded-tl-lg border px-4 py-3"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#1d4ed8" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span
            className="text-xs"
            style={{
              color: "#9ca3af",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal Orden de Compra ────────────────────────────────────────────────────

function OrdenCompraModal({
  onClose,
  onSubmit,
  sending,
}: {
  onClose: () => void;
  onSubmit: (r: OrdenCompraRequest) => void;
  sending: boolean;
}) {
  const [proveedorId, setProveedorId] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("Costusoft S.A.S");
  const [observaciones, setObservaciones] = useState("");

  function submit() {
    onSubmit({
      proveedorId: proveedorId ? Number(proveedorId) : undefined,
      nombreEmpresa: nombreEmpresa.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
    });
    onClose();
  }

  const inputStyle = {
    borderColor: "#d0d5dd",
    backgroundColor: "#ffffff",
    color: "#101828",
    fontFamily: "var(--font-poppins), sans-serif",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(15,23,42,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-3xl border p-6 mx-4"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              }}
            >
              <FileText size={20} style={{ color: "#ffffff" }} />
            </div>
            <div>
              <h3
                className="text-base font-semibold"
                style={{
                  color: "#101828",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Generar orden de compra
              </h3>
              <p
                className="text-xs"
                style={{
                  color: "#667085",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                La IA genera la carta con los insumos con stock bajo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 transition"
            style={{ color: "#9ca3af" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-4">
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]"
              style={{
                color: "#475467",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              ID Proveedor{" "}
              <span
                style={{
                  color: "#9ca3af",
                  fontWeight: 400,
                  textTransform: "none",
                }}
              >
                (opcional)
              </span>
            </label>
            <input
              type="number"
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              placeholder="Ej: 1  — deja vacío para requisición general"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1d4ed8";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(29,78,216,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d5dd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]"
              style={{
                color: "#475467",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Nombre empresa
            </label>
            <input
              type="text"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              placeholder="Costusoft S.A.S"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1d4ed8";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(29,78,216,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d5dd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]"
              style={{
                color: "#475467",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Observaciones{" "}
              <span
                style={{
                  color: "#9ca3af",
                  fontWeight: 400,
                  textTransform: "none",
                }}
              >
                (opcional)
              </span>
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: entrega en máximo 5 días hábiles"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1d4ed8";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(29,78,216,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d5dd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
            style={{
              borderColor: "#d0d5dd",
              color: "#475467",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              opacity: sending ? 0.75 : 1,
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            <Sparkles size={15} />
            Generar con IA
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

interface IAViewProps {
  canOrdenCompra?: boolean;
}

export default function IAView({ canOrdenCompra = false }: IAViewProps) {
  const {
    messages,
    input,
    setInput,
    sending,
    estado,
    loadingEstado,
    activeType,
    bottomRef,
    sendChat,
    sendAnalisis,
    loadBriefing,
    generarOrdenCompra,
    clearMessages,
    checkEstado,
  } = useIA();

  const [ordenModal, setOrdenModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendChat(input);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize
    const ta = e.currentTarget;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }

  const serviceUp = estado?.disponible ?? false;

  return (
    <section
      className="flex flex-col gap-3 sm:gap-5 pb-4 sm:pb-6"
      style={{ height: "calc(100dvh - 64px - 32px - 16px)", minHeight: 480 }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3 rounded-2xl sm:rounded-[28px] border px-4 py-3 sm:px-6 sm:py-5"
        style={{
          borderColor: "#e0e7ff",
          background:
            "linear-gradient(135deg, rgba(29,78,216,0.09) 0%, rgba(124,58,237,0.06) 100%)",
          flexShrink: 0,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              }}
            >
              <BrainCircuit size={18} style={{ color: "#ffffff" }} />
            </div>
            <div>
              <h1
                className="text-base sm:text-xl font-semibold"
                style={{
                  color: "#101828",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Asistente IA
              </h1>
              <p
                className="text-[11px] sm:text-xs hidden sm:block"
                style={{
                  color: "#667085",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Análisis de inventario en lenguaje natural · Groq LLaMA 3.3
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Estado del servicio */}
            <div
              className="flex items-center gap-1.5 rounded-2xl border px-2 py-1 sm:px-3 sm:py-1.5"
              style={{
                borderColor: serviceUp ? "#abefc6" : "#fecaca",
                backgroundColor: serviceUp ? "#f0fdf4" : "#fef2f2",
              }}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: serviceUp ? "#22c55e" : "#ef4444" }}
              />
              <span
                className="text-[10px] sm:text-xs font-semibold"
                style={{
                  color: serviceUp ? "#15803d" : "#b42318",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {loadingEstado
                  ? "..."
                  : serviceUp
                    ? "Groq OK"
                    : "No disponible"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void checkEstado()}
              title="Verificar estado"
              className="flex h-8 w-8 items-center justify-center rounded-xl transition"
              style={{ color: "#9ca3af" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <RefreshCw
                size={14}
                className={loadingEstado ? "animate-spin" : ""}
              />
            </button>
            <button
              type="button"
              onClick={clearMessages}
              title="Limpiar chat"
              className="flex h-8 w-8 items-center justify-center rounded-xl transition"
              style={{ color: "#9ca3af" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
                e.currentTarget.style.color = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* ── Quick actions — scroll horizontal en móvil ── */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {/* Briefing del día — destacado */}
          <button
            type="button"
            onClick={() => void loadBriefing()}
            disabled={sending}
            className="flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60"
            style={{
              borderColor: "#e0e7ff",
              background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              color: "#ffffff",
              fontFamily: "var(--font-poppins), sans-serif",
              opacity: sending && activeType !== "BRIEFING" ? 0.6 : 1,
            }}
          >
            {activeType === "BRIEFING" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            Briefing del día
          </button>

          {/* 9 tipos de análisis */}
          {TIPOS.map((t) => (
            <button
              key={t.tipo}
              type="button"
              onClick={() => void sendAnalisis(t.tipo, t.label)}
              disabled={sending}
              title={t.desc}
              className="flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60"
              style={{
                borderColor: activeType === t.tipo ? t.color : "#eaecf0",
                backgroundColor: activeType === t.tipo ? t.bg : "#ffffff",
                color: t.color,
                fontFamily: "var(--font-poppins), sans-serif",
                boxShadow:
                  activeType === t.tipo ? `0 0 0 2px ${t.color}30` : undefined,
              }}
              onMouseEnter={(e) => {
                if (!sending) {
                  e.currentTarget.style.backgroundColor = t.bg;
                  e.currentTarget.style.borderColor = t.color;
                }
              }}
              onMouseLeave={(e) => {
                if (activeType !== t.tipo) {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#eaecf0";
                }
              }}
            >
              {activeType === t.tipo ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <t.icon size={11} />
              )}
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Área de mensajes ── */}
      <div
        className="flex-1 overflow-hidden rounded-2xl sm:rounded-3xl border"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#f8fafc",
          boxShadow: "inset 0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        <div
          className="h-full overflow-y-auto px-3 py-3 sm:px-5 sm:py-5"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {messages.map((msg) =>
              msg.role === "welcome" ? (
                <WelcomeBubble key={msg.id} />
              ) : msg.role === "user" ? (
                <UserBubble key={msg.id} msg={msg} />
              ) : (
                <AIBubble key={msg.id} msg={msg} />
              ),
            )}

            {/* Typing indicator */}
            <AnimatePresence>
              {sending && (
                <TypingIndicator
                  key="typing"
                  label={
                    activeType === "BRIEFING"
                      ? "Generando briefing del día..."
                      : activeType === "ORDEN"
                        ? "Redactando orden de compra..."
                        : activeType
                          ? `Analizando ${TIPOS.find((t) => t.tipo === activeType)?.label ?? activeType}...`
                          : "Pensando..."
                  }
                />
              )}
            </AnimatePresence>

            {/* Anchor para scroll */}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* ── Input area ── */}
      <div
        className="flex-shrink-0 rounded-2xl sm:rounded-3xl border p-2 sm:p-3"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
        }}
      >
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder="Escribe tu consulta..."
              rows={1}
              className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
              style={{
                borderColor: "#d0d5dd",
                color: "#101828",
                fontFamily: "var(--font-poppins), sans-serif",
                lineHeight: 1.6,
                maxHeight: 120,
                scrollbarWidth: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1d4ed8";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(29,78,216,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d5dd";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Botón Orden de Compra */}
          {canOrdenCompra && (
            <button
              type="button"
              onClick={() => setOrdenModal(true)}
              disabled={sending}
              title="Generar orden de compra"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border transition disabled:opacity-60"
              style={{
                borderColor: "#e0e7ff",
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dbeafe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#eff6ff";
              }}
            >
              <FileText size={17} />
            </button>
          )}

          {/* Botón Enviar */}
          <button
            type="button"
            onClick={() => void sendChat(input)}
            disabled={!input.trim() || sending}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
          >
            {sending ? (
              <Loader2
                size={17}
                className="animate-spin"
                style={{ color: "#ffffff" }}
              />
            ) : (
              <Send size={17} style={{ color: "#ffffff" }} />
            )}
          </button>
        </div>

        <p
          className="mt-2 px-1 text-[10px]"
          style={{
            color: "#d1d5db",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          CostuSoft IA · Solo analiza datos del inventario · No modifica
          registros
        </p>
      </div>

      {/* ── Modal Orden de Compra ── */}
      <AnimatePresence>
        {ordenModal && (
          <OrdenCompraModal
            onClose={() => setOrdenModal(false)}
            onSubmit={(req) => {
              void generarOrdenCompra(req);
            }}
            sending={sending}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

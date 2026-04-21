"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Loader2,
  Send,
  User,
} from "lucide-react";
import { institucionService } from "@/app/services/institucion.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mensaje {
  role: "user" | "ia";
  text: string;
  tiempoMs?: number;
}

const SUGERENCIAS = [
  "¿En qué estado está mi último pedido?",
  "¿Cuántos uniformes tiene configurados mi colegio?",
  "¿Cuándo llegará mi pedido activo?",
  "¿Hay algún pedido listo para entrega?",
];

// ─── Markdown básico ──────────────────────────────────────────────────────────

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      result.push(
        <p key={i} className="mt-3 text-sm font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
          {line.slice(4)}
        </p>
      );
    } else if (line.startsWith("## ")) {
      result.push(
        <p key={i} className="mt-3 text-sm font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
          {line.slice(3)}
        </p>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      result.push(
        <p key={i} className="text-sm font-semibold mt-1" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      result.push(
        <p key={i} className="text-sm flex gap-1.5 mt-0.5" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
          <span style={{ flexShrink: 0 }}>•</span>
          <span>{line.slice(2)}</span>
        </p>
      );
    } else if (line.trim() === "") {
      result.push(<div key={i} style={{ height: 6 }} />);
    } else {
      result.push(
        <p key={i} className="text-sm leading-relaxed" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
          {line}
        </p>
      );
    }
    i++;
  }
  return result;
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Mensaje }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: isUser ? "#eef2ff" : "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)",
          background: isUser ? "#eef2ff" : "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)",
        }}
      >
        {isUser ? (
          <User size={14} style={{ color: "#6366f1" }} />
        ) : (
          <BrainCircuit size={14} style={{ color: "#ffffff" }} />
        )}
      </div>

      {/* Burbuja */}
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3"
        style={{
          backgroundColor: isUser ? "#6366f1" : "#f8f9fb",
          border: isUser ? "none" : "1px solid #eaecf0",
          borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
        }}
      >
        {isUser ? (
          <p className="text-sm" style={{ color: "#ffffff", fontFamily: "'Poppins', sans-serif" }}>
            {msg.text}
          </p>
        ) : (
          <div>{parseMarkdown(msg.text)}</div>
        )}
        {msg.tiempoMs && (
          <p className="mt-1 text-[10px]" style={{ color: isUser ? "rgba(255,255,255,0.6)" : "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
            {(msg.tiempoMs / 1000).toFixed(1)}s
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Thinking ────────────────────────────────────────────────────────────────

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)" }}
      >
        <BrainCircuit size={14} style={{ color: "#ffffff" }} />
      </div>
      <div
        className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
        style={{ backgroundColor: "#f8f9fb", border: "1px solid #eaecf0", borderRadius: "4px 18px 18px 18px" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#6366f1" }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function IAPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  const enviar = async (texto?: string) => {
    const q = (texto ?? pregunta).trim();
    if (!q || cargando) return;

    setMensajes((prev) => [...prev, { role: "user", text: q }]);
    setPregunta("");
    setCargando(true);

    try {
      const res = await institucionService.chatIa({ pregunta: q });
      setMensajes((prev) => [
        ...prev,
        { role: "ia", text: res.respuesta, tiempoMs: res.tiempoMs },
      ]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        {
          role: "ia",
          text: err instanceof Error ? err.message : "Ocurrió un error al procesar tu pregunta. Intenta de nuevo.",
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <section className="flex h-[calc(100vh-160px)] flex-col gap-0 pb-2">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 rounded-t-3xl border border-b-0 px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)",
          borderColor: "transparent",
        }}
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <BrainCircuit size={20} style={{ color: "#ffffff" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Asistente IA
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Poppins', sans-serif" }}>
            Consulta el estado de tus pedidos y uniformes
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        >
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#4ade80" }} />
          <span className="text-[10px] font-medium text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Activo
          </span>
        </div>
      </div>

      {/* ── Chat area ──────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto border border-b-0 border-t-0 px-5 py-5"
        style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff" }}
      >
        {mensajes.length === 0 ? (
          /* Welcome */
          <div className="flex flex-col items-center justify-center h-full gap-5 py-8">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-3xl"
              style={{ background: "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
            >
              <BrainCircuit size={28} style={{ color: "#ffffff" }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                ¿En qué te puedo ayudar?
              </p>
              <p className="mt-1 text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Pregúntame sobre tus pedidos, uniformes o cualquier consulta sobre tu colegio.
              </p>
            </div>

            {/* Sugerencias */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm sm:grid-cols-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-2xl border px-3 py-2.5 text-left text-xs font-medium transition-all"
                  style={{
                    borderColor: "#e5e7eb",
                    backgroundColor: "#fafafa",
                    color: "#374151",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#eef2ff";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fafafa";
                    (e.currentTarget as HTMLButtonElement).style.color = "#374151";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {mensajes.map((msg, idx) => (
              <Bubble key={idx} msg={msg} />
            ))}
            <AnimatePresence>
              {cargando && <ThinkingBubble />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      <div
        className="rounded-b-3xl border px-4 py-3"
        style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff" }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl border px-3 py-2"
          style={{ borderColor: "#e5e7eb" }}
        >
          <textarea
            ref={textareaRef}
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta... (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            style={{
              color: "#101828",
              fontFamily: "'Poppins', sans-serif",
              maxHeight: "120px",
              minHeight: "24px",
            }}
          />
          <button
            onClick={() => enviar()}
            disabled={!pregunta.trim() || cargando}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-colors"
            style={{
              backgroundColor: pregunta.trim() && !cargando ? "#6366f1" : "#e5e7eb",
              color: pregunta.trim() && !cargando ? "#ffffff" : "#9ca3af",
              border: "none",
              cursor: pregunta.trim() && !cargando ? "pointer" : "not-allowed",
            }}
          >
            {cargando ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px]" style={{ color: "#c0c7d0", fontFamily: "'Poppins', sans-serif" }}>
          La IA conoce el contexto de tu colegio · Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </section>
  );
}

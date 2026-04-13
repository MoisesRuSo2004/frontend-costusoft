"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { iaService } from "@/app/services/ia.service";
import type {
  ChatMsg,
  EstadoIA,
  OrdenCompraRequest,
  TipoConsulta,
} from "@/app/types/ia";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const WELCOME_MSG: ChatMsg = {
  id: "welcome",
  role: "welcome",
  content:
    "Hola, soy el asistente IA de CostuSoft. Puedo analizar tu inventario en tiempo real usando Groq LLaMA 3.3.\n\nPuedes hacerme preguntas en lenguaje natural o usar los análisis rápidos para obtener reportes estructurados al instante.",
  ts: Date.now(),
};

export function useIA() {
  const [messages, setMessages]       = useState<ChatMsg[]>([WELCOME_MSG]);
  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [estado, setEstado]           = useState<EstadoIA | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(true);
  const [activeType, setActiveType]   = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ── Cargar estado del servicio ────────────────────────────────────────

  const checkEstado = useCallback(async () => {
    setLoadingEstado(true);
    try {
      const e = await iaService.estado();
      setEstado(e);
    } catch {
      setEstado({ disponible: false, proveedor: "Groq", status: "NO_DISPONIBLE" });
    } finally {
      setLoadingEstado(false);
    }
  }, []);

  useEffect(() => { void checkEstado(); }, [checkEstado]);

  // ── Scroll automático al último mensaje ───────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Helpers ───────────────────────────────────────────────────────────

  function addUserMsg(content: string) {
    setMessages(prev => [...prev, { id: uid(), role: "user", content, ts: Date.now() }]);
  }

  function addAIMsg(partial: Omit<ChatMsg, "id" | "role" | "ts">) {
    setMessages(prev => [...prev, { id: uid(), role: "ai", ts: Date.now(), ...partial }]);
  }

  // ── Chat libre ────────────────────────────────────────────────────────

  const sendChat = useCallback(async (pregunta: string) => {
    if (!pregunta.trim() || sending) return;
    const q = pregunta.trim();
    addUserMsg(q);
    setInput("");
    setSending(true);
    try {
      const res = await iaService.chat({ pregunta: q });
      addAIMsg({
        content: res.respuesta,
        tipo: "Chat libre",
        modelo: res.modelo,
        tokensUsados: res.tokensUsados,
        tiempoMs: res.tiempoMs,
      });
    } catch (e) {
      addAIMsg({ content: `Error al procesar tu pregunta: ${e instanceof Error ? e.message : "Intenta de nuevo."}` });
    } finally {
      setSending(false);
    }
  }, [sending]);

  // ── Análisis estructurado ─────────────────────────────────────────────

  const sendAnalisis = useCallback(async (tipo: TipoConsulta, label: string) => {
    if (sending) return;
    setActiveType(tipo);
    setSending(true);
    addUserMsg(`Ejecutar análisis: **${label}**`);
    try {
      const res = await iaService.consultar({ tipo });
      addAIMsg({
        content: res.respuesta,
        tipo: label,
        modelo: res.modelo,
        tokensUsados: res.tokensUsados,
        tiempoMs: res.tiempoMs,
      });
    } catch (e) {
      addAIMsg({ content: `Error en análisis ${label}: ${e instanceof Error ? e.message : "Intenta de nuevo."}` });
    } finally {
      setSending(false);
      setActiveType(null);
    }
  }, [sending]);

  // ── Briefing diario ───────────────────────────────────────────────────

  const loadBriefing = useCallback(async () => {
    if (sending) return;
    setActiveType("BRIEFING");
    setSending(true);
    addUserMsg("Generar **briefing ejecutivo del día**");
    try {
      const res = await iaService.briefing();
      addAIMsg({
        content: res.respuesta,
        tipo: "Briefing del día",
        modelo: res.modelo,
        tokensUsados: res.tokensUsados,
        tiempoMs: res.tiempoMs,
      });
    } catch (e) {
      addAIMsg({ content: `Error al generar briefing: ${e instanceof Error ? e.message : "Intenta de nuevo."}` });
    } finally {
      setSending(false);
      setActiveType(null);
    }
  }, [sending]);

  // ── Orden de compra ───────────────────────────────────────────────────

  const generarOrdenCompra = useCallback(async (request: OrdenCompraRequest) => {
    if (sending) return;
    setActiveType("ORDEN");
    setSending(true);
    addUserMsg(
      `Generar **orden de compra**${request.proveedorId ? ` para proveedor #${request.proveedorId}` : " general"}` +
      (request.nombreEmpresa ? ` — ${request.nombreEmpresa}` : "")
    );
    try {
      const res = await iaService.ordenCompra(request);
      addAIMsg({
        content: res.textoOrden,
        tipo: "Orden de compra",
        modelo: res.modelo,
        tokensUsados: res.tokensUsados,
        tiempoMs: res.tiempoMs,
        isOrdenCompra: true,
        insumosIncluidos: res.insumosIncluidos,
      });
    } catch (e) {
      addAIMsg({ content: `Error al generar orden: ${e instanceof Error ? e.message : "Intenta de nuevo."}` });
    } finally {
      setSending(false);
      setActiveType(null);
    }
  }, [sending]);

  // ── Limpiar chat ──────────────────────────────────────────────────────

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MSG]);
  }, []);

  return {
    messages,
    input, setInput,
    sending,
    estado, loadingEstado,
    activeType,
    bottomRef,
    sendChat,
    sendAnalisis,
    loadBriefing,
    generarOrdenCompra,
    clearMessages,
    checkEstado,
  };
}

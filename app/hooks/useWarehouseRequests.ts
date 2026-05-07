"use client";

import { useCallback, useEffect, useState } from "react";
import { entradaService } from "@/app/services/entrada.service";
import { salidaService } from "@/app/services/salida.service";
import type { EntradaResponse } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";

// ─── Tipo para la sección de actividad reciente ───────────────────────────────

export type RecentItem = {
  tipo: "entrada" | "salida";
  id: number;
  estado: string;
  fecha: string;
  label: string;
  sub: string;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWarehouseRequests() {
  // Cola de trabajo — SOLO pendientes (no mezclamos estados en memoria)
  const [entradasPendientes, setEntradasPendientes] = useState<EntradaResponse[]>([]);
  const [salidasPendientes, setSalidasPendientes]   = useState<SalidaResponse[]>([]);

  // Totales server-side para KPIs precisos (independientes del tamaño de página)
  const [totalEntPend, setTotalEntPend] = useState(0);
  const [totalSalPend, setTotalSalPend] = useState(0);

  // Actividad reciente: máximo 6, construida desde el backend y actualizada optimistamente
  const [recientes, setRecientes] = useState<RecentItem[]>([]);

  // Contador de lo procesado en la sesión actual (se resetea en cada recarga)
  const [procesadasEnSesion, setProcesadasEnSesion] = useState(0);

  const [loading,    setLoading]    = useState(true);
  const [actionKey,  setActionKey]  = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Carga inicial ──────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProcesadasEnSesion(0); // nuevo foco, contador fresco

    try {
      // 4 llamadas en paralelo:
      //   1-2: solo PENDIENTES para la cola de trabajo (size 50 cubre la práctica real)
      //   3-4: últimas 8 entradas/salidas (cualquier estado) para derivar actividad reciente
      const [entPend, salPend, entRecent, salRecent] = await Promise.allSettled([
        entradaService.listarPorEstado("PENDIENTE", { size: 50 }),
        salidaService.listarPorEstado("PENDIENTE", { size: 50 }),
        entradaService.listar({ size: 8 }),
        salidaService.listar({ size: 8 }),
      ]);

      // ── Pendientes ──
      if (entPend.status === "fulfilled") {
        setEntradasPendientes(entPend.value.content);
        setTotalEntPend(entPend.value.totalElements); // total real del servidor
      }
      if (salPend.status === "fulfilled") {
        setSalidasPendientes(salPend.value.content);
        setTotalSalPend(salPend.value.totalElements);
      }

      // ── Actividad reciente: filtrar pendientes, combinar, ordenar, top 6 ──
      const entItems = entRecent.status === "fulfilled"
        ? entRecent.value.content.filter(e => e.estado !== "PENDIENTE")
        : [];
      const salItems = salRecent.status === "fulfilled"
        ? salRecent.value.content.filter(s => s.estado !== "PENDIENTE")
        : [];

      setRecientes(
        [
          ...entItems.map(e => ({
            tipo:   "entrada" as const,
            id:     e.id,
            estado: e.estado,
            fecha:  e.createdAt ?? e.fecha,
            label:  `Entrada #${e.id}`,
            sub:    e.proveedorNombre ?? e.descripcion,
          })),
          ...salItems.map(s => ({
            tipo:   "salida" as const,
            id:     s.id,
            estado: s.estado,
            fecha:  s.createdAt ?? s.fecha,
            label:  `Salida #${s.id}`,
            sub:    s.colegioNombre ?? s.descripcion,
          })),
        ]
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 6),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Actualización optimista al procesar un item ────────────────────────────

  /** Saca el item de la cola y lo agrega al top de recientes. */
  const procesarItem = useCallback((item: RecentItem) => {
    setRecientes(prev => [item, ...prev].slice(0, 6));
    setProcesadasEnSesion(prev => prev + 1);
  }, []);

  // ── Acciones ───────────────────────────────────────────────────────────────

  const confirmarEntrada = useCallback(async (id: number) => {
    setActionKey(`e-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await entradaService.confirmar(id);
      setEntradasPendientes(prev => prev.filter(e => e.id !== id));
      setTotalEntPend(prev => Math.max(0, prev - 1));
      procesarItem({
        tipo:   "entrada",
        id:     updated.id,
        estado: updated.estado,
        fecha:  updated.createdAt ?? updated.fecha,
        label:  `Entrada #${updated.id}`,
        sub:    updated.proveedorNombre ?? updated.descripcion,
      });
      setSuccessMsg(`Entrada #${id} confirmada correctamente.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar la entrada.");
    } finally {
      setActionKey(null);
    }
  }, [procesarItem]);

  const rechazarEntrada = useCallback(async (id: number, motivo: string) => {
    setActionKey(`e-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await entradaService.rechazar(id, { motivo });
      setEntradasPendientes(prev => prev.filter(e => e.id !== id));
      setTotalEntPend(prev => Math.max(0, prev - 1));
      procesarItem({
        tipo:   "entrada",
        id:     updated.id,
        estado: updated.estado,
        fecha:  updated.createdAt ?? updated.fecha,
        label:  `Entrada #${updated.id}`,
        sub:    updated.proveedorNombre ?? updated.descripcion,
      });
      setSuccessMsg(`Entrada #${id} rechazada.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo rechazar la entrada.");
    } finally {
      setActionKey(null);
    }
  }, [procesarItem]);

  const confirmarSalida = useCallback(async (id: number) => {
    setActionKey(`s-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await salidaService.confirmar(id);
      setSalidasPendientes(prev => prev.filter(s => s.id !== id));
      setTotalSalPend(prev => Math.max(0, prev - 1));
      procesarItem({
        tipo:   "salida",
        id:     updated.id,
        estado: updated.estado,
        fecha:  updated.createdAt ?? updated.fecha,
        label:  `Salida #${updated.id}`,
        sub:    updated.colegioNombre ?? updated.descripcion,
      });
      setSuccessMsg(`Salida #${id} confirmada correctamente.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar la salida.");
    } finally {
      setActionKey(null);
    }
  }, [procesarItem]);

  const rechazarSalida = useCallback(async (id: number, motivo: string) => {
    setActionKey(`s-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await salidaService.rechazar(id, { motivo });
      setSalidasPendientes(prev => prev.filter(s => s.id !== id));
      setTotalSalPend(prev => Math.max(0, prev - 1));
      procesarItem({
        tipo:   "salida",
        id:     updated.id,
        estado: updated.estado,
        fecha:  updated.createdAt ?? updated.fecha,
        label:  `Salida #${updated.id}`,
        sub:    updated.colegioNombre ?? updated.descripcion,
      });
      setSuccessMsg(`Salida #${id} rechazada.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo rechazar la salida.");
    } finally {
      setActionKey(null);
    }
  }, [procesarItem]);

  return {
    entradasPendientes,
    salidasPendientes,
    recientes,
    stats: {
      totalPendientes:    totalEntPend + totalSalPend,
      entradasPendientes: totalEntPend,
      salidasPendientes:  totalSalPend,
      procesadasEnSesion,
    },
    loading,
    actionKey,
    error,
    successMsg,
    clearSuccess: () => setSuccessMsg(null),
    recargar: cargar,
    confirmarEntrada,
    rechazarEntrada,
    confirmarSalida,
    rechazarSalida,
  };
}

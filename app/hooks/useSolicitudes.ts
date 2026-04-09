"use client";

import { useCallback, useEffect, useState } from "react";
import { pedidoService } from "@/app/services/pedido.service";
import { entradaService } from "@/app/services/entrada.service";
import { salidaService } from "@/app/services/salida.service";
import type { PedidoResponse } from "@/app/types/pedido";
import type { EntradaResponse } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";
import type { PageData } from "@/app/types/pagination";

interface SolicitudesState {
  // Pedidos
  pedidosCalculados: PedidoResponse[];
  loadingPedidos: boolean;

  // Entradas
  entradasPendientes: EntradaResponse[];
  loadingEntradas: boolean;

  // Salidas
  salidasPendientes: SalidaResponse[];
  loadingSalidas: boolean;

  // General
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  submitting: boolean;
}

/**
 * Hook unificado para la bandeja de solicitudes.
 *
 * Combina:
 * - Pedidos en estado CALCULADO (listos para confirmar)
 * - Entradas en estado PENDIENTE (esperando confirmación)
 * - Salidas en estado PENDIENTE (esperando confirmación)
 *
 * Flujo de trabajo:
 * 1. ADMIN revisa pedidos calculados y los confirma para producción
 * 2. BODEGA confirma/rechaza entradas de insumos
 * 3. BODEGA confirma/rechaza salidas de insumos
 */
export function useSolicitudes() {
  const [state, setState] = useState<SolicitudesState>({
    pedidosCalculados: [],
    loadingPedidos: false,
    entradasPendientes: [],
    loadingEntradas: false,
    salidasPendientes: [],
    loadingSalidas: false,
    loading: true,
    error: null,
    successMessage: null,
    submitting: false,
  });

  // ── Cargar pedidos calculados ──────────────────────────────────────────

  const loadPedidosCalculados = useCallback(async () => {
    setState((s) => ({ ...s, loadingPedidos: true }));
    try {
      const response = await pedidoService.listarPorEstado("CALCULADO", { size: 100 });
      setState((s) => ({ ...s, pedidosCalculados: response.content }));
    } catch (err) {
      console.error("Error cargando pedidos calculados:", err);
      setState((s) => ({ ...s, pedidosCalculados: [] }));
    } finally {
      setState((s) => ({ ...s, loadingPedidos: false }));
    }
  }, []);

  // ── Cargar entradas pendientes ─────────────────────────────────────────

  const loadEntradasPendientes = useCallback(async () => {
    setState((s) => ({ ...s, loadingEntradas: true }));
    try {
      const response = await entradaService.listarPorEstado("PENDIENTE", { size: 100 });
      setState((s) => ({ ...s, entradasPendientes: response.content }));
    } catch (err) {
      console.error("Error cargando entradas pendientes:", err);
      setState((s) => ({ ...s, entradasPendientes: [] }));
    } finally {
      setState((s) => ({ ...s, loadingEntradas: false }));
    }
  }, []);

  // ── Cargar salidas pendientes ──────────────────────────────────────────

  const loadSalidasPendientes = useCallback(async () => {
    setState((s) => ({ ...s, loadingSalidas: true }));
    try {
      const response = await salidaService.listarPorEstado("PENDIENTE", { size: 100 });
      setState((s) => ({ ...s, salidasPendientes: response.content }));
    } catch (err) {
      console.error("Error cargando salidas pendientes:", err);
      setState((s) => ({ ...s, salidasPendientes: [] }));
    } finally {
      setState((s) => ({ ...s, loadingSalidas: false }));
    }
  }, []);

  // ── Cargar todo ────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await Promise.all([
        loadPedidosCalculados(),
        loadEntradasPendientes(),
        loadSalidasPendientes(),
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar solicitudes";
      setState((s) => ({ ...s, error: msg }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [loadPedidosCalculados, loadEntradasPendientes, loadSalidasPendientes]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Acciones de Pedidos ────────────────────────────────────────────────

  const confirmarPedido = useCallback(async (id: number): Promise<boolean> => {
    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      await pedidoService.confirmar(id);
      setState((s) => ({ ...s, successMessage: "Pedido confirmado exitosamente" }));
      await loadPedidosCalculados();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al confirmar pedido";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  }, [loadPedidosCalculados]);

  const cancelarPedido = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      await pedidoService.cancelar(id, { motivo });
      setState((s) => ({ ...s, successMessage: "Pedido cancelado" }));
      await loadPedidosCalculados();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cancelar pedido";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  }, [loadPedidosCalculados]);

  // ── Acciones de Entradas ───────────────────────────────────────────────

  const confirmarEntrada = useCallback(async (id: number): Promise<boolean> => {
    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      await entradaService.confirmar(id);
      setState((s) => ({ ...s, successMessage: "Entrada confirmada. Stock incrementado." }));
      await loadEntradasPendientes();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al confirmar entrada";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  }, [loadEntradasPendientes]);

  const rechazarEntrada = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      await entradaService.rechazar(id, { motivo });
      setState((s) => ({ ...s, successMessage: "Entrada rechazada" }));
      await loadEntradasPendientes();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al rechazar entrada";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  }, [loadEntradasPendientes]);

  // ── Acciones de Salidas ────────────────────────────────────────────────

  const confirmarSalida = useCallback(async (id: number): Promise<boolean> => {
    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      await salidaService.confirmar(id);
      setState((s) => ({ ...s, successMessage: "Salida confirmada. Stock descontado." }));
      await loadSalidasPendientes();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al confirmar salida";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  }, [loadSalidasPendientes]);

  const rechazarSalida = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    setState((s) => ({ ...s, submitting: true, error: null }));
    try {
      await salidaService.rechazar(id, { motivo });
      setState((s) => ({ ...s, successMessage: "Salida rechazada" }));
      await loadSalidasPendientes();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al rechazar salida";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  }, [loadSalidasPendientes]);

  // ── Helpers ────────────────────────────────────────────────────────────

  const clearMessages = useCallback(() => {
    setState((s) => ({ ...s, error: null, successMessage: null }));
  }, []);

  const totalSolicitudes = state.pedidosCalculados.length + state.entradasPendientes.length + state.salidasPendientes.length;

  return {
    // Datos
    pedidosCalculados: state.pedidosCalculados,
    entradasPendientes: state.entradasPendientes,
    salidasPendientes: state.salidasPendientes,
    totalSolicitudes,

    // Estados
    loading: state.loading,
    loadingPedidos: state.loadingPedidos,
    loadingEntradas: state.loadingEntradas,
    loadingSalidas: state.loadingSalidas,
    submitting: state.submitting,
    error: state.error,
    successMessage: state.successMessage,

    // Acciones
    reload: loadAll,
    reloadPedidos: loadPedidosCalculados,
    reloadEntradas: loadEntradasPendientes,
    reloadSalidas: loadSalidasPendientes,
    confirmarPedido,
    cancelarPedido,
    confirmarEntrada,
    rechazarEntrada,
    confirmarSalida,
    rechazarSalida,
    clearMessages,
  };
}

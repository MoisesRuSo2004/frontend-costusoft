"use client";

import { useCallback, useEffect, useState } from "react";
import { entradaService } from "@/app/services/entrada.service";
import { salidaService } from "@/app/services/salida.service";
import type { EntradaResponse } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";

export function useWarehouseRequests() {
  const [entradas, setEntradas] = useState<EntradaResponse[]>([]);
  const [salidas, setSalidas] = useState<SalidaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ent, sal] = await Promise.allSettled([
        entradaService.listar({ size: 100 }),
        salidaService.listar({ size: 100 }),
      ]);
      if (ent.status === "fulfilled") setEntradas(ent.value.content);
      if (sal.status === "fulfilled") setSalidas(sal.value.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const confirmarEntrada = useCallback(async (id: number) => {
    setActionKey(`e-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await entradaService.confirmar(id);
      setEntradas(prev => prev.map(e => e.id === id ? updated : e));
      setSuccessMsg(`Entrada #${id} confirmada correctamente.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar la entrada.");
    } finally {
      setActionKey(null);
    }
  }, []);

  const rechazarEntrada = useCallback(async (id: number, motivo: string) => {
    setActionKey(`e-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await entradaService.rechazar(id, { motivo });
      setEntradas(prev => prev.map(e => e.id === id ? updated : e));
      setSuccessMsg(`Entrada #${id} rechazada.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo rechazar la entrada.");
    } finally {
      setActionKey(null);
    }
  }, []);

  const confirmarSalida = useCallback(async (id: number) => {
    setActionKey(`s-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await salidaService.confirmar(id);
      setSalidas(prev => prev.map(s => s.id === id ? updated : s));
      setSuccessMsg(`Salida #${id} confirmada correctamente.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar la salida.");
    } finally {
      setActionKey(null);
    }
  }, []);

  const rechazarSalida = useCallback(async (id: number, motivo: string) => {
    setActionKey(`s-${id}`);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await salidaService.rechazar(id, { motivo });
      setSalidas(prev => prev.map(s => s.id === id ? updated : s));
      setSuccessMsg(`Salida #${id} rechazada.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo rechazar la salida.");
    } finally {
      setActionKey(null);
    }
  }, []);

  const entradasPendientes = entradas.filter(e => e.estado === "PENDIENTE");
  const salidasPendientes = salidas.filter(s => s.estado === "PENDIENTE");
  const confirmadas =
    entradas.filter(e => e.estado === "CONFIRMADA").length +
    salidas.filter(s => s.estado === "CONFIRMADA").length;
  const rechazadas =
    entradas.filter(e => e.estado === "RECHAZADA").length +
    salidas.filter(s => s.estado === "RECHAZADA").length;

  return {
    entradas,
    salidas,
    entradasPendientes,
    salidasPendientes,
    stats: {
      totalPendientes: entradasPendientes.length + salidasPendientes.length,
      entradasPendientes: entradasPendientes.length,
      salidasPendientes: salidasPendientes.length,
      confirmadas,
      rechazadas,
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

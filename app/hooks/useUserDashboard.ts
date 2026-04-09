"use client";

import { useCallback, useEffect, useState } from "react";
import { entradaService } from "@/app/services/entrada.service";
import { salidaService } from "@/app/services/salida.service";
import { insumoService } from "@/app/services/insumo.service";
import type { EntradaResponse, EstadoMovimiento } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";
import type { InsumoResponse } from "@/app/types/insumo";

export type ActividadTipo = "entrada" | "salida";

export interface ActividadItem {
  key: string;
  tipo: ActividadTipo;
  id: number;
  titulo: string;
  subtitulo: string;
  estado: EstadoMovimiento;
  fecha: string;
  insumos: number;
}

export function useUserDashboard() {
  const [entradas, setEntradas] = useState<EntradaResponse[]>([]);
  const [salidas, setSalidas] = useState<SalidaResponse[]>([]);
  const [stockBajo, setStockBajo] = useState<InsumoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ent, sal, sb] = await Promise.allSettled([
        entradaService.listar({ size: 50 }),
        salidaService.listar({ size: 50 }),
        insumoService.stockBajo(),
      ]);
      if (ent.status === "fulfilled") setEntradas(ent.value.content);
      if (sal.status === "fulfilled") setSalidas(sal.value.content);
      if (sb.status === "fulfilled") setStockBajo(sb.value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const totalEntradas = entradas.length;
  const totalSalidas = salidas.length;
  const pendientes =
    entradas.filter(e => e.estado === "PENDIENTE").length +
    salidas.filter(s => s.estado === "PENDIENTE").length;
  const confirmadas =
    entradas.filter(e => e.estado === "CONFIRMADA").length +
    salidas.filter(s => s.estado === "CONFIRMADA").length;

  const actividad: ActividadItem[] = [
    ...entradas.slice(0, 8).map<ActividadItem>(e => ({
      key: "e-" + e.id,
      tipo: "entrada",
      id: e.id,
      titulo: "Entrada #" + e.id,
      subtitulo: e.proveedorNombre ?? e.descripcion,
      estado: e.estado,
      fecha: e.createdAt ?? e.fecha,
      insumos: e.detalles.length,
    })),
    ...salidas.slice(0, 8).map<ActividadItem>(s => ({
      key: "s-" + s.id,
      tipo: "salida",
      id: s.id,
      titulo: "Salida #" + s.id,
      subtitulo: s.colegioNombre ?? s.descripcion,
      estado: s.estado,
      fecha: s.createdAt ?? s.fecha,
      insumos: s.detalles.length,
    })),
  ]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 10);

  return {
    entradas, salidas, stockBajo,
    totalEntradas, totalSalidas, pendientes, confirmadas,
    actividad, loading, error, recargar: cargar,
  };
}

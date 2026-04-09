"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { pedidoService } from "@/app/services/pedido.service";
import { entradaService } from "@/app/services/entrada.service";
import { salidaService } from "@/app/services/salida.service";

// ── Tipo público ──────────────────────────────────────────────────────────────

export type NotifTipo = "pedido" | "entrada" | "salida";

export interface NotifItem {
  id: string;
  tipo: NotifTipo;
  titulo: string;
  subtitulo: string;
}

interface NotificacionesCtxValue {
  items: NotifItem[];
  total: number;
  loading: boolean;
  refetch: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const NotificacionesCtx = createContext<NotificacionesCtxValue>({
  items: [],
  total: 0,
  loading: false,
  refetch: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 20_000; // 20 s

export function NotificacionesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pedidos, entradas, salidas] = await Promise.allSettled([
        pedidoService.listarPorEstado("CALCULADO", { size: 5 }),
        entradaService.listarPorEstado("PENDIENTE", { size: 5 }),
        salidaService.listarPorEstado("PENDIENTE", { size: 5 }),
      ]);

      const notifs: NotifItem[] = [];
      let count = 0;

      if (pedidos.status === "fulfilled") {
        count += pedidos.value.totalElements;
        pedidos.value.content.slice(0, 3).forEach((p) => {
          notifs.push({
            id: `pedido-${p.id}`,
            tipo: "pedido",
            titulo: `Pedido ${p.numeroPedido}`,
            subtitulo: `${p.colegio.nombre} · Requiere confirmación`,
          });
        });
      }

      if (entradas.status === "fulfilled") {
        count += entradas.value.totalElements;
        entradas.value.content.slice(0, 2).forEach((e) => {
          notifs.push({
            id: `entrada-${e.id}`,
            tipo: "entrada",
            titulo: `Entrada de insumos #${e.id}`,
            subtitulo: `${e.proveedorNombre ?? "Sin proveedor"} · Pendiente`,
          });
        });
      }

      if (salidas.status === "fulfilled") {
        count += salidas.value.totalElements;
        salidas.value.content.slice(0, 2).forEach((s) => {
          notifs.push({
            id: `salida-${s.id}`,
            tipo: "salida",
            titulo: `Salida de insumos #${s.id}`,
            subtitulo: `${s.colegioNombre ?? "Sin colegio"} · Pendiente`,
          });
        });
      }

      setItems(notifs);
      setTotal(count);
    } catch {
      // falla silenciosa — no interrumpimos la UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAll]);

  return (
    <NotificacionesCtx.Provider
      value={{ items, total, loading, refetch: fetchAll }}
    >
      {children}
    </NotificacionesCtx.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotificaciones() {
  return useContext(NotificacionesCtx);
}

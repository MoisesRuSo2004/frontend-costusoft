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
import { solicitudEspecialService } from "@/app/services/solicitudEspecialService";

// ── Tipo público ──────────────────────────────────────────────────────────────

export type NotifTipo = "pedido" | "pedido_institucion" | "entrada" | "salida" | "solicitud_especial";

export interface NotifItem {
  id: string;
  tipo: NotifTipo;
  titulo: string;
  subtitulo: string;
}

interface NotificacionesCtxValue {
  items: NotifItem[];
  total: number;
  /** Pedidos BORRADOR (nuevos de institución) + CALCULADO (esperan confirmación) */
  pedidosCount: number;
  /** Solicitudes especiales PENDIENTE de instituciones */
  solicitudesCount: number;
  /** Pedidos CALCULADO + Entradas PENDIENTE + Salidas PENDIENTE (bandeja /solicitudes) */
  bandejaSolicitudesCount: number;
  loading: boolean;
  refetch: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const NotificacionesCtx = createContext<NotificacionesCtxValue>({
  items: [],
  total: 0,
  pedidosCount: 0,
  solicitudesCount: 0,
  bandejaSolicitudesCount: 0,
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
  const [pedidosCount, setPedidosCount] = useState(0);
  const [solicitudesCount, setSolicitudesCount] = useState(0);
  const [bandejaSolicitudesCount, setBandejaSolicitudesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pedidosCalculados, pedidosBorrador, entradas, salidas, solicitudesEspeciales] = await Promise.allSettled([
        pedidoService.listarPorEstado("CALCULADO", { size: 5 }),
        pedidoService.listarPorEstado("BORRADOR",  { size: 5 }),
        entradaService.listarPorEstado("PENDIENTE", { size: 5 }),
        salidaService.listarPorEstado("PENDIENTE", { size: 5 }),
        solicitudEspecialService.listarPorEstado("PENDIENTE", { size: 5 }),
      ]);

      const notifs: NotifItem[] = [];
      let count = 0;

      // Pedidos en BORRADOR — recién creados por instituciones, esperan ser calculados
      if (pedidosBorrador.status === "fulfilled") {
        count += pedidosBorrador.value.totalElements;
        pedidosBorrador.value.content.slice(0, 3).forEach((p) => {
          notifs.push({
            id: `pedido-borrador-${p.id}`,
            tipo: "pedido_institucion",
            titulo: `Nuevo pedido de ${p.colegio?.nombre ?? "institución"}`,
            subtitulo: `${p.numeroPedido ?? `#${p.id}`} · Pendiente de cálculo`,
          });
        });
      }

      // Pedidos CALCULADOS — esperan confirmación del admin
      if (pedidosCalculados.status === "fulfilled") {
        count += pedidosCalculados.value.totalElements;
        pedidosCalculados.value.content.slice(0, 3).forEach((p) => {
          notifs.push({
            id: `pedido-${p.id}`,
            tipo: "pedido",
            titulo: `Pedido ${p.numeroPedido}`,
            subtitulo: `${p.colegio?.nombre ?? "Sin colegio"} · Requiere confirmación`,
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

      // Solicitudes especiales PENDIENTE — enviadas por instituciones
      if (solicitudesEspeciales.status === "fulfilled") {
        count += solicitudesEspeciales.value.totalElements;
        solicitudesEspeciales.value.content.slice(0, 3).forEach((s) => {
          notifs.push({
            id: `solicitud-especial-${s.id}`,
            tipo: "solicitud_especial",
            titulo: `Solicitud de ${s.colegioNombre}`,
            subtitulo: `${s.asunto} · Pendiente de revisión`,
          });
        });
      }

      const newPedidosCount =
        (pedidosBorrador.status === "fulfilled" ? pedidosBorrador.value.totalElements : 0) +
        (pedidosCalculados.status === "fulfilled" ? pedidosCalculados.value.totalElements : 0);

      const newSolicitudesCount =
        solicitudesEspeciales.status === "fulfilled"
          ? solicitudesEspeciales.value.totalElements
          : 0;

      const newBandejaSolicitudesCount =
        (pedidosCalculados.status === "fulfilled" ? pedidosCalculados.value.totalElements : 0) +
        (entradas.status === "fulfilled" ? entradas.value.totalElements : 0) +
        (salidas.status === "fulfilled" ? salidas.value.totalElements : 0);

      setItems(notifs);
      setTotal(count);
      setPedidosCount(newPedidosCount);
      setSolicitudesCount(newSolicitudesCount);
      setBandejaSolicitudesCount(newBandejaSolicitudesCount);
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
      value={{ items, total, pedidosCount, solicitudesCount, bandejaSolicitudesCount, loading, refetch: fetchAll }}
    >
      {children}
    </NotificacionesCtx.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotificaciones() {
  return useContext(NotificacionesCtx);
}

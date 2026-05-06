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

// ── Tipos ─────────────────────────────────────────────────────────────────────

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
  /** IDs de notificaciones ya leídas */
  leidasIds: Set<string>;
  /** Cantidad de notificaciones no leídas */
  unreadCount: number;
  marcarLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
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
  leidasIds: new Set(),
  unreadCount: 0,
  marcarLeida: () => {},
  marcarTodasLeidas: () => {},
});

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "cs_notif_leidas";

function loadLeidas(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveLeidas(set: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...set]));
  } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 20_000;

export function NotificacionesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pedidosCount, setPedidosCount] = useState(0);
  const [solicitudesCount, setSolicitudesCount] = useState(0);
  const [bandejaSolicitudesCount, setBandejaSolicitudesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [leidasIds, setLeidasIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    return loadLeidas();
  });

  const marcarLeida = useCallback((id: string) => {
    setLeidasIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveLeidas(next);
      return next;
    });
  }, []);

  const marcarTodasLeidas = useCallback(() => {
    setItems(current => {
      setLeidasIds(prev => {
        const next = new Set([...prev, ...current.map(i => i.id)]);
        saveLeidas(next);
        return next;
      });
      return current;
    });
  }, []);

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
            titulo: `Entrada de insumos`,
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
            titulo: `Salida de insumos`,
            subtitulo: `${s.colegioNombre ?? "Sin colegio"} · Pendiente`,
          });
        });
      }

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
      // falla silenciosa
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAll]);

  const unreadCount = items.filter(i => !leidasIds.has(i.id)).length;

  return (
    <NotificacionesCtx.Provider value={{
      items, total, pedidosCount, solicitudesCount, bandejaSolicitudesCount,
      loading, refetch: fetchAll,
      leidasIds, unreadCount, marcarLeida, marcarTodasLeidas,
    }}>
      {children}
    </NotificacionesCtx.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotificaciones() {
  return useContext(NotificacionesCtx);
}

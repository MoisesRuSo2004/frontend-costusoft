"use client";

import SolicitudesClient from "@/app/components/admin/solicitudes/SolicitudesClient";

/**
 * AdminRequestsDashboard - Bandeja de solicitudes unificada
 *
 * Este módulo muestra todas las solicitudes pendientes que requieren atención:
 * - Pedidos CALCULADOS listos para confirmar
 * - Entradas PENDIENTES esperando confirmación
 * - Salidas PENDIENTES esperando confirmación
 */
export default function AdminRequestsDashboard() {
  return <SolicitudesClient />;
}

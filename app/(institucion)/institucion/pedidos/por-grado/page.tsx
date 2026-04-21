"use client";

import React, { useState } from "react";
import { institucionService } from "@/app/services/institucion.service";
import type {
  PedidoPorGradoRequest,
  PedidoPorGradoResponse,
  PedidoPorGradoItem,
  InstitucionPedidoRequest,
  InstitucionPedidoDetalleRequest,
} from "@/app/types/institucion";

export default function PorGradoPage() {
  const [grado, setGrado] = useState("");
  const [cantidadEstudiantes, setCantidadEstudiantes] = useState(1);
  const [tipoUniforme, setTipoUniforme] = useState("");
  const [fecha, setFecha] = useState<string | undefined>(undefined);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<PedidoPorGradoResponse | null>(null);
  const [assignments, setAssignments] = useState<Record<number, { talla: string; cantidad: number }>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function generarPlantilla() {
    setLoading(true);
    setMessage(null);
    try {
      const req: PedidoPorGradoRequest = {
        grado,
        cantidadEstudiantes,
        tipoUniforme: tipoUniforme || undefined,
        fechaEstimadaEntrega: fecha || undefined,
        observaciones: observaciones || undefined,
      };
      const res = await institucionService.crearPedidoPorGrado(req);
      setTemplate(res);

      // Inicializar asignaciones por item con talla primera y cantidad sugerida
      const init: Record<number, { talla: string; cantidad: number }> = {};
      res.items.forEach((it) => {
        init[it.uniformeId] = {
          talla: it.tallasDisponibles[0] ?? "",
          cantidad: it.cantidadSugerida,
        };
      });
      setAssignments(init);
    } catch (err: any) {
      setMessage(err?.message ?? "Error al generar plantilla");
    } finally {
      setLoading(false);
    }
  }

  function updateAssignment(uniformeId: number, field: "talla" | "cantidad", value: string | number) {
    setAssignments((s) => ({
      ...s,
      [uniformeId]: {
        ...(s[uniformeId] ?? { talla: "", cantidad: 0 }),
        [field]: value,
      },
    }));
  }

  async function crearPedidoFinal() {
    if (!template) return;
    setLoading(true);
    setMessage(null);
    try {
      const detalles: InstitucionPedidoDetalleRequest[] = template.items.flatMap((it) => {
        const assign = assignments[it.uniformeId];
        if (!assign) return [];
        return [
          {
            uniformeId: it.uniformeId,
            cantidad: Number(assign.cantidad),
            talla: String(assign.talla),
          },
        ];
      });

      const payload: InstitucionPedidoRequest = {
        fechaEstimadaEntrega: template.fechaEstimadaEntrega ?? undefined,
        observaciones: observaciones || undefined,
        detalles,
      };

      const creado = await institucionService.crearPedido(payload);
      setMessage(`Pedido creado (id: ${creado.id}, número: ${creado.numeroPedido ?? "-"}).`);
      // Opcional: redirigir a la vista del pedido. Por ahora dejamos la plantilla visible.
      setTemplate(null);
      setAssignments({});
    } catch (err: any) {
      setMessage(err?.message ?? "Error al crear pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Generar plantilla: Pedido por grado</h1>

      <div style={{ marginTop: 12 }}>
        <label>Grado</label>
        <input value={grado} onChange={(e) => setGrado(e.target.value)} placeholder="6°" />
      </div>

      <div>
        <label>Cantidad de estudiantes</label>
        <input type="number" value={cantidadEstudiantes} min={1} onChange={(e) => setCantidadEstudiantes(Number(e.target.value))} />
      </div>

      <div>
        <label>Tipo de uniforme (opcional)</label>
        <input value={tipoUniforme} onChange={(e) => setTipoUniforme(e.target.value)} placeholder="Diario" />
      </div>

      <div>
        <label>Fecha estimada de entrega (opcional)</label>
        <input type="date" value={fecha ?? ""} onChange={(e) => setFecha(e.target.value || undefined)} />
      </div>

      <div>
        <label>Observaciones</label>
        <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={generarPlantilla} disabled={loading || !grado || cantidadEstudiantes < 1}>
          Generar plantilla
        </button>
      </div>

      {message && <div style={{ marginTop: 12 }}>{message}</div>}

      {template && (
        <div style={{ marginTop: 20 }}>
          <h2>Plantilla para {template.colegioNombre} — grado {template.grado}</h2>
          <p>Cantidad estudiantes: {template.cantidadEstudiantes}</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr>
                <th>Prenda</th>
                <th>Cantidad sugerida</th>
                <th>Talla</th>
                <th>Cantidad final</th>
              </tr>
            </thead>
            <tbody>
              {template.items.map((it: PedidoPorGradoItem) => (
                <tr key={it.uniformeId}>
                  <td>{it.nombre} ({it.tipo})</td>
                  <td style={{ textAlign: "center" }}>{it.cantidadSugerida}</td>
                  <td>
                    <select value={assignments[it.uniformeId]?.talla ?? (it.tallasDisponibles[0] ?? "")} onChange={(e) => updateAssignment(it.uniformeId, "talla", e.target.value)}>
                      {it.tallasDisponibles.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" min={0} value={assignments[it.uniformeId]?.cantidad ?? it.cantidadSugerida} onChange={(e) => updateAssignment(it.uniformeId, "cantidad", Number(e.target.value))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 12 }}>
            <button onClick={crearPedidoFinal} disabled={loading}>Crear pedido (BORRADOR)</button>
          </div>
        </div>
      )}
    </div>
  );
}

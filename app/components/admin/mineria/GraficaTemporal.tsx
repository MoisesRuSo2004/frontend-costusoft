"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Gráfica temporal en SVG (sin dependencias): varias series, banda de
 * confianza, líneas de referencia, marca de fecha y tooltip al pasar el mouse.
 */

export interface PuntoGrafica {
  fecha: string; // YYYY-MM-DD
  valor: number;
}

export interface SerieGrafica {
  id: string;
  nombre: string;
  color: string;
  puntos: PuntoGrafica[];
  punteada?: boolean;
  /** Unidad de la serie en el tooltip (si no, la de la gráfica). */
  unidad?: string;
  /** Banda sombreada (p. ej. intervalo de confianza del pronóstico). */
  banda?: { fecha: string; minimo: number; maximo: number }[];
}

export interface LineaReferencia {
  valor: number;
  etiqueta: string;
  color: string;
}

interface Props {
  series: SerieGrafica[];
  referencias?: LineaReferencia[];
  marca?: { fecha: string; etiqueta: string };
  alto?: number;
  unidad?: string;
  formatoFecha?: (fecha: Date) => string;
  descripcion: string;
}

const MARGEN = { arriba: 18, derecha: 18, abajo: 34, izquierda: 56 };
const FUENTE = "'Poppins', sans-serif";

const aFecha = (texto: string) => {
  const [a, m, d] = texto.split("-").map(Number);
  return new Date(a, m - 1, d);
};

const fechaCorta = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" });
const numero = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

/** Divisiones "redondas" del eje Y (1, 2, 2.5, 5 × 10ⁿ). */
function marcasY(maximo: number, cantidad = 5): number[] {
  if (maximo <= 0) return [0, 1];
  const paso = maximo / cantidad;
  const magnitud = 10 ** Math.floor(Math.log10(paso));
  const normal = paso / magnitud;
  const redondo = (normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 2.5 ? 2.5 : normal <= 5 ? 5 : 10) * magnitud;
  const marcas: number[] = [];
  for (let v = 0; v <= maximo + redondo * 0.001; v += redondo) marcas.push(Number(v.toFixed(6)));
  if (marcas[marcas.length - 1] < maximo) marcas.push(marcas[marcas.length - 1] + redondo);
  return marcas;
}

export default function GraficaTemporal({
  series,
  referencias = [],
  marca,
  alto = 280,
  unidad = "",
  formatoFecha = (f) => fechaCorta.format(f),
  descripcion,
}: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(640);
  const [indiceHover, setIndiceHover] = useState<number | null>(null);

  // Ancho adaptable al contenedor.
  useEffect(() => {
    const elemento = contenedor.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => setAncho(Math.max(280, entrada.contentRect.width)));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const geometria = useMemo(() => {
    const fechas = Array.from(
      new Set(series.flatMap((s) => [...s.puntos.map((p) => p.fecha), ...(s.banda ?? []).map((b) => b.fecha)])),
    ).sort();
    if (fechas.length === 0) return null;

    const tiempos = fechas.map((f) => aFecha(f).getTime());
    const t0 = tiempos[0];
    const t1 = tiempos[tiempos.length - 1] === t0 ? t0 + 86_400_000 : tiempos[tiempos.length - 1];
    const maximoDatos = Math.max(
      0,
      ...series.flatMap((s) => [...s.puntos.map((p) => p.valor), ...(s.banda ?? []).map((b) => b.maximo)]),
      ...referencias.map((r) => r.valor),
    );
    const marcas = marcasY(maximoDatos * 1.05);
    const yMax = marcas[marcas.length - 1] || 1;

    const anchoUtil = ancho - MARGEN.izquierda - MARGEN.derecha;
    const altoUtil = alto - MARGEN.arriba - MARGEN.abajo;
    const x = (fecha: string) => MARGEN.izquierda + ((aFecha(fecha).getTime() - t0) / (t1 - t0)) * anchoUtil;
    const y = (valor: number) => MARGEN.arriba + altoUtil - (valor / yMax) * altoUtil;

    const camino = (puntos: PuntoGrafica[]) =>
      puntos.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.fecha).toFixed(1)},${y(p.valor).toFixed(1)}`).join(" ");
    const area = (banda: NonNullable<SerieGrafica["banda"]>) =>
      banda.length < 2
        ? ""
        : [
            ...banda.map((b, i) => `${i === 0 ? "M" : "L"}${x(b.fecha).toFixed(1)},${y(b.maximo).toFixed(1)}`),
            ...[...banda].reverse().map((b) => `L${x(b.fecha).toFixed(1)},${y(b.minimo).toFixed(1)}`),
            "Z",
          ].join(" ");

    // Unas 6 etiquetas en el eje X, repartidas por igual.
    const saltoX = Math.max(1, Math.ceil(fechas.length / Math.max(2, Math.floor(anchoUtil / 90))));
    const etiquetasX = fechas.filter((_, i) => i % saltoX === 0);

    return { fechas, x, y, camino, area, marcas, etiquetasX, altoUtil, anchoUtil };
  }, [series, referencias, ancho, alto]);

  if (!geometria) {
    return (
      <div ref={contenedor} className="flex items-center justify-center rounded-xl text-sm"
        style={{ height: alto, backgroundColor: "#f9fafb", color: "#9ca3af", fontFamily: FUENTE }}>
        Sin datos para graficar
      </div>
    );
  }

  const { fechas, x, y, camino, area, marcas, etiquetasX } = geometria;
  const fechaHover = indiceHover === null ? null : fechas[indiceHover];

  const alMover = (evento: React.MouseEvent<SVGSVGElement>) => {
    const caja = evento.currentTarget.getBoundingClientRect();
    const posicion = ((evento.clientX - caja.left) / caja.width) * ancho;
    let mejor = 0;
    let distancia = Infinity;
    fechas.forEach((f, i) => {
      const d = Math.abs(x(f) - posicion);
      if (d < distancia) {
        distancia = d;
        mejor = i;
      }
    });
    setIndiceHover(mejor);
  };

  const valoresHover = fechaHover
    ? series
        .map((s) => ({ serie: s, punto: s.puntos.find((p) => p.fecha === fechaHover) }))
        .filter((v): v is { serie: SerieGrafica; punto: PuntoGrafica } => Boolean(v.punto))
    : [];
  const xHover = fechaHover ? x(fechaHover) : 0;
  const tooltipALaIzquierda = xHover > ancho * 0.62;

  return (
    <div ref={contenedor} className="relative w-full select-none">
      <svg width={ancho} height={alto} role="img" aria-label={descripcion}
        onMouseMove={alMover} onMouseLeave={() => setIndiceHover(null)} style={{ display: "block", cursor: "crosshair" }}>
        {/* Cuadrícula y eje Y */}
        {marcas.map((m) => (
          <g key={m}>
            <line x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(m)} y2={y(m)} stroke="#f0f2f5" />
            <text x={MARGEN.izquierda - 8} y={y(m)} textAnchor="end" dominantBaseline="middle"
              fontSize={10.5} fill="#98a2b3" fontFamily={FUENTE}>
              {numero.format(m)}
            </text>
          </g>
        ))}

        {/* Eje X */}
        {etiquetasX.map((f) => (
          // En los bordes se alinea hacia adentro para no cortar el texto.
          <text key={f} x={x(f)} y={alto - 10}
            textAnchor={x(f) > ancho - MARGEN.derecha - 30 ? "end" : x(f) < MARGEN.izquierda + 30 ? "start" : "middle"}
            fontSize={10.5} fill="#98a2b3" fontFamily={FUENTE}>
            {formatoFecha(aFecha(f))}
          </text>
        ))}

        {/* Bandas de confianza */}
        {series.map((s) => s.banda && s.banda.length > 1 && (
          <path key={`banda-${s.id}`} d={area(s.banda)} fill={s.color} opacity={0.12} />
        ))}

        {/* Referencias horizontales (p. ej. stock mínimo) */}
        {referencias.map((r) => (
          <g key={`ref-${r.etiqueta}-${r.valor}`}>
            <line x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(r.valor)} y2={y(r.valor)}
              stroke={r.color} strokeDasharray="2 4" strokeWidth={1.4} />
            <text x={ancho - MARGEN.derecha - 4} y={y(r.valor) - 5} textAnchor="end" fontSize={10}
              fill={r.color} fontFamily={FUENTE} fontWeight={600}>
              {r.etiqueta}
            </text>
          </g>
        ))}

        {/* Marca vertical (fecha de corte: separa historia de pronóstico) */}
        {marca && marca.fecha >= fechas[0] && marca.fecha <= fechas[fechas.length - 1] && (
          <g>
            <line x1={x(marca.fecha)} x2={x(marca.fecha)} y1={MARGEN.arriba} y2={alto - MARGEN.abajo}
              stroke="#c4b5fd" strokeDasharray="4 4" />
            <text x={x(marca.fecha) + 6} y={MARGEN.arriba + 10} fontSize={10} fill="#7c3aed" fontFamily={FUENTE} fontWeight={600}>
              {marca.etiqueta}
            </text>
          </g>
        )}

        {/* Series */}
        {series.map((s) => (
          <path key={s.id} d={camino(s.puntos)} fill="none" stroke={s.color} strokeWidth={2.2}
            strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.punteada ? "6 5" : undefined} />
        ))}

        {/* Guía y puntos del hover */}
        {fechaHover && (
          <g pointerEvents="none">
            <line x1={xHover} x2={xHover} y1={MARGEN.arriba} y2={alto - MARGEN.abajo} stroke="#d0d5dd" />
            {valoresHover.map(({ serie, punto }) => (
              <circle key={serie.id} cx={xHover} cy={y(punto.valor)} r={4} fill="#fff" stroke={serie.color} strokeWidth={2} />
            ))}
          </g>
        )}
      </svg>

      {fechaHover && valoresHover.length > 0 && (
        <div className="pointer-events-none absolute rounded-xl border px-3 py-2 shadow-lg"
          style={{
            top: MARGEN.arriba,
            left: tooltipALaIzquierda ? undefined : xHover + 12,
            right: tooltipALaIzquierda ? ancho - xHover + 12 : undefined,
            backgroundColor: "rgba(255,255,255,0.97)",
            borderColor: "#e5e7eb",
            fontFamily: FUENTE,
            minWidth: 150,
          }}>
          <p className="text-[11px] font-semibold mb-1" style={{ color: "#344054" }}>
            {aFecha(fechaHover).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {valoresHover.map(({ serie, punto }) => (
            <div key={serie.id} className="flex items-center gap-2 text-[11.5px]" style={{ color: "#475467" }}>
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: serie.color }} />
              <span className="flex-1 truncate">{serie.nombre}</span>
              <span className="font-semibold" style={{ color: "#101828" }}>
                {numero.format(punto.valor)} {serie.unidad ?? unidad}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

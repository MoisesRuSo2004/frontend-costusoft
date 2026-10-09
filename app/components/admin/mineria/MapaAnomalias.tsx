"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AnomaliaMovimiento } from "@/app/types/mineria";
import { FUENTE, aFecha, fechaLarga } from "./ui";

/**
 * Mapa de anomalías: cada alerta es un punto. Eje X = fecha; eje Y (escala
 * logarítmica) = cuántas veces lo habitual fue la cantidad. La línea "1×" es
 * lo normal: arriba quedan las cantidades altas y abajo las bajas.
 */

const MARGEN = { arriba: 16, derecha: 18, abajo: 32, izquierda: 52 };
const Y_MIN = 0.02;
const Y_MAX = 20;
const MARCAS_Y = [0.05, 0.1, 0.25, 0.5, 1, 2, 4, 10];
export const COLOR_NIVEL = { alta: "#dc2626", media: "#d97706" } as const;

const fechaCorta = new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" });

interface Props {
  anomalias: AnomaliaMovimiento[];
  desde: string;
  hasta: string;
  seleccionada?: AnomaliaMovimiento | null;
  alElegir?: (anomalia: AnomaliaMovimiento) => void;
  alto?: number;
}

export default function MapaAnomalias({ anomalias, desde, hasta, seleccionada, alElegir, alto = 260 }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(640);
  const [encima, setEncima] = useState<AnomaliaMovimiento | null>(null);

  useEffect(() => {
    const elemento = contenedor.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => setAncho(Math.max(280, entrada.contentRect.width)));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const escala = useMemo(() => {
    const t0 = aFecha(desde).getTime();
    const t1 = Math.max(aFecha(hasta).getTime(), t0 + 86_400_000);
    const anchoUtil = ancho - MARGEN.izquierda - MARGEN.derecha;
    const altoUtil = alto - MARGEN.arriba - MARGEN.abajo;
    const x = (fecha: string) => MARGEN.izquierda + ((aFecha(fecha).getTime() - t0) / (t1 - t0)) * anchoUtil;
    const y = (veces: number) => {
      const v = Math.min(Y_MAX, Math.max(Y_MIN, veces));
      return MARGEN.arriba + altoUtil * (1 - (Math.log10(v) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN)));
    };
    // Una etiqueta por mes, sin amontonarse.
    const meses: string[] = [];
    const cursor = new Date(aFecha(desde).getFullYear(), aFecha(desde).getMonth() + 1, 1);
    while (cursor.getTime() <= t1) {
      meses.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-01`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    const salto = Math.max(1, Math.ceil(meses.length / Math.max(2, Math.floor(anchoUtil / 70))));
    return { x, y, meses: meses.filter((_, i) => i % salto === 0) };
  }, [ancho, alto, desde, hasta]);

  const { x, y, meses } = escala;
  const destacada = encima ?? seleccionada ?? null;

  return (
    <div ref={contenedor} className="relative w-full select-none">
      <svg width={ancho} height={alto} role="img" style={{ display: "block" }}
        aria-label="Mapa de anomalías: fecha frente a cuántas veces lo habitual fue la cantidad">
        {/* Zonas: arriba = más de lo habitual, abajo = menos */}
        <rect x={MARGEN.izquierda} y={MARGEN.arriba} width={ancho - MARGEN.izquierda - MARGEN.derecha}
          height={y(1) - MARGEN.arriba} fill="#fef2f2" opacity={0.45} />
        <rect x={MARGEN.izquierda} y={y(1)} width={ancho - MARGEN.izquierda - MARGEN.derecha}
          height={alto - MARGEN.abajo - y(1)} fill="#fffbeb" opacity={0.55} />

        {MARCAS_Y.map((m) => (
          <g key={m}>
            <line x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(m)} y2={y(m)}
              stroke={m === 1 ? "#98a2b3" : "#eef0f4"} strokeDasharray={m === 1 ? "5 4" : undefined} />
            <text x={MARGEN.izquierda - 8} y={y(m)} textAnchor="end" dominantBaseline="middle" fontSize={10.5}
              fill={m === 1 ? "#475467" : "#98a2b3"} fontWeight={m === 1 ? 600 : 400} fontFamily={FUENTE}>
              {m === 1 ? "habitual" : `${m}×`}
            </text>
          </g>
        ))}

        {meses.map((f) => (
          <text key={f} x={x(f)} y={alto - 10} fontSize={10.5} fill="#98a2b3" fontFamily={FUENTE}
            textAnchor={x(f) > ancho - MARGEN.derecha - 30 ? "end" : "middle"}>
            {fechaCorta.format(aFecha(f))}
          </text>
        ))}

        {/* Las medias primero, para que las altas queden encima */}
        {[...anomalias].sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === "media" ? -1 : 1)).map((a) => {
          const activa = destacada?.renglon_id === a.renglon_id && destacada.movimiento === a.movimiento;
          return (
            <circle key={`${a.movimiento}-${a.renglon_id}`}
              cx={x(a.fecha)} cy={y(a.veces_mediana)} r={activa ? 8 : 4.5 + a.puntaje * 3}
              fill={COLOR_NIVEL[a.nivel]} fillOpacity={activa ? 0.95 : 0.7}
              stroke="#fff" strokeWidth={activa ? 2.5 : 1.2} style={{ cursor: alElegir ? "pointer" : "default", transition: "r .15s" }}
              onMouseEnter={() => setEncima(a)} onMouseLeave={() => setEncima(null)} onClick={() => alElegir?.(a)} />
          );
        })}
      </svg>

      {encima && (
        <div className="pointer-events-none absolute z-10 max-w-[280px] rounded-xl border px-3 py-2 shadow-lg"
          style={{
            top: Math.max(4, y(encima.veces_mediana) - 70),
            left: x(encima.fecha) > ancho * 0.6 ? undefined : x(encima.fecha) + 14,
            right: x(encima.fecha) > ancho * 0.6 ? ancho - x(encima.fecha) + 14 : undefined,
            backgroundColor: "rgba(255,255,255,0.97)", borderColor: "#e5e7eb", fontFamily: FUENTE,
          }}>
          <p className="text-[11px] font-semibold" style={{ color: COLOR_NIVEL[encima.nivel] }}>
            Alerta {encima.nivel} · {fechaLarga(encima.fecha)}
          </p>
          <p className="text-[12px] font-semibold" style={{ color: "#101828" }}>{encima.insumo}</p>
          <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: "#475467" }}>{encima.razon}</p>
        </div>
      )}
    </div>
  );
}

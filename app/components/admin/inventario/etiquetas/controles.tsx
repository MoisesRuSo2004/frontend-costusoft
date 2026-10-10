"use client";

import { Minus, Plus } from "lucide-react";
import { TAMANOS, type TamanoEtiqueta } from "./etiquetaQr";

export const FUENTE = "var(--font-poppins), sans-serif";
export const AZUL = "#0b3d91";

/** Elección del tamaño de etiqueta. */
export function SelectorTamano({ valor, alCambiar }: { valor: TamanoEtiqueta; alCambiar: (t: TamanoEtiqueta) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tamaño de la etiqueta">
      {(Object.keys(TAMANOS) as TamanoEtiqueta[]).map((t) => {
        const activo = t === valor;
        return (
          <button key={t} type="button" role="radio" aria-checked={activo} onClick={() => alCambiar(t)}
            className="rounded-2xl border px-3 py-2 text-left transition"
            style={{
              borderColor: activo ? AZUL : "#e5e7eb", backgroundColor: activo ? "rgba(11,61,145,0.06)" : "#fff",
              boxShadow: activo ? "0 0 0 3px rgba(11,61,145,0.10)" : "none", fontFamily: FUENTE,
            }}>
            <span className="block text-sm font-semibold" style={{ color: activo ? AZUL : "#101828" }}>{TAMANOS[t].etiqueta}</span>
            <span className="block text-[11px] leading-tight" style={{ color: "#667085" }}>{TAMANOS[t].detalle}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Número de copias con botones − / +. */
export function SelectorCopias({ valor, maximo, alCambiar }: { valor: number; maximo: number; alCambiar: (n: number) => void }) {
  const fijar = (n: number) => alCambiar(Math.min(maximo, Math.max(1, Math.round(n) || 1)));
  const boton = "flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40";
  return (
    <div className="inline-flex items-center gap-2">
      <button type="button" className={boton} style={{ borderColor: "#e5e7eb", color: "#374151" }}
        onClick={() => fijar(valor - 1)} disabled={valor <= 1} aria-label="Una copia menos"><Minus size={14} /></button>
      <input type="number" min={1} max={maximo} value={valor} onChange={(e) => fijar(Number(e.target.value))}
        aria-label="Copias" className="h-9 w-14 rounded-xl border text-center text-sm outline-none"
        style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: FUENTE }} />
      <button type="button" className={boton} style={{ borderColor: "#e5e7eb", color: "#374151" }}
        onClick={() => fijar(valor + 1)} disabled={valor >= maximo} aria-label="Una copia más"><Plus size={14} /></button>
    </div>
  );
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: FUENTE }}>
      {children}
    </p>
  );
}

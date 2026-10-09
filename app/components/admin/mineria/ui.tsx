"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

/**
 * Piezas compartidas de la sección Minería de datos: estilo, formatos y
 * controles (selector de insumos, pastillas, segmentado, interruptor).
 */

export const FUENTE = "'Poppins', sans-serif";
export const VIOLETA = "#7c3aed";

export const numero = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });

/** "2026-05-29" → fecha local (sin desfase de zona horaria). */
export const aFecha = (texto: string) => {
  const [a, m, d] = texto.split("-").map(Number);
  return new Date(a, m - 1, d);
};

/** "1 unidad", "2 unidades", "1 metro"… (la unidad viene en plural). */
export const conUnidad = (valor: number, unidad: string) => {
  const texto = unidad.toLowerCase();
  if (Math.round(valor) !== 1) return `${numero.format(valor)} ${texto}`;
  return `1 ${texto.endsWith("des") ? texto.slice(0, -2) : texto.endsWith("s") ? texto.slice(0, -1) : texto}`;
};

/** Veces la mediana con dos cifras significativas en valores pequeños (0,03×, 0,5×, 4,2×). */
export const veces = (valor: number) =>
  `${new Intl.NumberFormat("es-CO", valor < 1 ? { maximumSignificantDigits: 2 } : { maximumFractionDigits: 1 }).format(valor)}×`;

export const fechaLarga = (texto: string | null) =>
  texto ? aFecha(texto).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const tarjeta: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 20,
  border: "1px solid #eef0f4",
  boxShadow: "0 1px 12px rgba(16,24,40,0.05)",
};

/** Botones segmentados (una sola opción activa). */
export function Segmentado<T extends string>({ opciones, valor, alCambiar }: {
  opciones: { valor: T; etiqueta: string }[];
  valor: T;
  alCambiar: (valor: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl p-1" style={{ backgroundColor: "#f4f4f7" }}>
      {opciones.map((o) => (
        <button key={o.valor} type="button" onClick={() => alCambiar(o.valor)}
          className="whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all"
          style={{
            fontFamily: FUENTE,
            color: valor === o.valor ? VIOLETA : "#667085",
            backgroundColor: valor === o.valor ? "#fff" : "transparent",
            boxShadow: valor === o.valor ? "0 1px 4px rgba(16,24,40,0.1)" : "none",
          }}>
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

export function Campo({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold" style={{ color: "#344054", fontFamily: FUENTE }}>{titulo}</p>
      {children}
      {ayuda && <p className="mt-1.5 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>{ayuda}</p>}
    </div>
  );
}

export function Pastilla({ activa, alTocar, children }: { activa: boolean; alTocar: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={alTocar}
      className="whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-all"
      style={{
        fontFamily: FUENTE,
        borderColor: activa ? VIOLETA : "#e5e7eb",
        backgroundColor: activa ? "#f5f3ff" : "#fff",
        color: activa ? VIOLETA : "#475467",
      }}>
      {children}
    </button>
  );
}

export function Interruptor({ activo, alCambiar }: { activo: boolean; alCambiar: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => alCambiar(!activo)}
      className="relative h-6 w-11 rounded-full transition-colors" style={{ backgroundColor: activo ? VIOLETA : "#d0d5dd" }}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: activo ? 22 : 2 }} />
    </button>
  );
}

export function SelectorInsumos({ insumos, cargando, elegidos, colorDe, alCambiar, maximo = 5, placeholder }: {
  insumos: { id: number; nombre: string; unidadMedida: string; stock: number }[];
  cargando: boolean;
  elegidos: number[];
  colorDe: (id: number) => string;
  alCambiar: (ids: number[]) => void;
  maximo?: number;
  placeholder?: string;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);
  const porId = useMemo(() => new Map(insumos.map((i) => [i.id, i])), [insumos]);
  const lleno = elegidos.length >= maximo;
  const opciones = insumos
    .filter((i) => !elegidos.includes(i.id) && i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .slice(0, 8);

  const agregar = (id: number) => {
    if (lleno) return;
    alCambiar([...elegidos, id]);
    setBusqueda("");
  };

  return (
    <div className="relative">
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border px-2 py-1.5"
        style={{ borderColor: abierto ? "#c4b5fd" : "#e5e7eb", boxShadow: abierto ? "0 0 0 3px rgba(124,58,237,0.1)" : "none" }}>
        {elegidos.map((id) => (
          <span key={id} className="flex items-center gap-1.5 rounded-lg py-1 pl-2 pr-1 text-[12.5px] font-medium"
            style={{ backgroundColor: `${colorDe(id)}14`, color: colorDe(id), fontFamily: FUENTE }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorDe(id) }} />
            {porId.get(id)?.nombre ?? `Insumo ${id}`}
            <button type="button" aria-label="Quitar" onClick={() => alCambiar(elegidos.filter((e) => e !== id))}
              className="rounded p-0.5 hover:bg-white/70"><X size={12} /></button>
          </span>
        ))}
        {!lleno && (
          <div className="flex min-w-[160px] flex-1 items-center gap-1.5 px-1">
            <Search size={14} style={{ color: "#98a2b3" }} />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              onFocus={() => setAbierto(true)} onBlur={() => setTimeout(() => setAbierto(false), 150)}
              onKeyDown={(e) => { if (e.key === "Enter" && opciones[0]) { e.preventDefault(); agregar(opciones[0].id); } }}
              placeholder={cargando ? "Cargando insumos…" : elegidos.length ? "Agregar otro…" : placeholder ?? "Busca un insumo (tela, cremallera…)"}
              className="w-full bg-transparent py-1 text-sm outline-none" style={{ fontFamily: FUENTE, color: "#344054" }} />
          </div>
        )}
      </div>
      <AnimatePresence>
        {abierto && !lleno && opciones.length > 0 && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border bg-white py-1 shadow-xl"
            style={{ borderColor: "#eef0f4" }}>
            {opciones.map((i) => (
              <li key={i.id}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => agregar(i.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-violet-50"
                  style={{ fontFamily: FUENTE, color: "#344054" }}>
                  {i.nombre}
                  <span className="text-xs" style={{ color: "#98a2b3" }}>stock {numero.format(i.stock)} {i.unidadMedida.toLowerCase()}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

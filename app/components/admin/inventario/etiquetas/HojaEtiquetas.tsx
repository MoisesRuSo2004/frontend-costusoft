"use client";

import { createPortal } from "react-dom";
import type { InsumoResponse } from "@/app/types/insumo";
import EtiquetaInsumo from "./EtiquetaInsumo";
import { TAMANOS, porHoja, type TamanoEtiqueta } from "./etiquetaQr";

const CLASE_IMPRIMIENDO = "imprimiendo-etiquetas";

/** Repite cada insumo `copias` veces y reparte las etiquetas en hojas carta. */
export function repartirEnHojas(insumos: InsumoResponse[], copias: number, tamano: TamanoEtiqueta) {
  const etiquetas = insumos.flatMap((i) => Array.from({ length: copias }, () => i));
  const capacidad = porHoja(tamano);
  const hojas: InsumoResponse[][] = [];
  for (let i = 0; i < etiquetas.length; i += capacidad) hojas.push(etiquetas.slice(i, i + capacidad));
  return hojas;
}

/** Una hoja carta con su cuadrícula de etiquetas. */
export function Hoja({ etiquetas, tamano }: { etiquetas: InsumoResponse[]; tamano: TamanoEtiqueta }) {
  const t = TAMANOS[tamano];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${t.columnas},${t.ancho}mm)`,
      gridAutoRows: `${t.alto}mm`, justifyContent: "center", alignContent: "start",
    }}>
      {etiquetas.map((insumo, i) => <EtiquetaInsumo key={`${insumo.id}-${i}`} insumo={insumo} tamano={tamano} />)}
    </div>
  );
}

/**
 * Las hojas que se imprimen. Viven fuera de la app (portal en <body>) y solo se
 * muestran al imprimir: globals.css oculta todo lo demás mientras <body> tiene
 * la clase "imprimiendo-etiquetas".
 */
export default function HojaEtiquetas({ insumos, copias, tamano }: {
  insumos: InsumoResponse[]; copias: number; tamano: TamanoEtiqueta;
}) {
  // Solo se monta dentro de un modal abierto con un clic: siempre en el navegador.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="zona-impresion" aria-hidden>
      {repartirEnHojas(insumos, copias, tamano).map((etiquetas, i) => (
        <div key={i} className="hoja-impresion"><Hoja etiquetas={etiquetas} tamano={tamano} /></div>
      ))}
    </div>,
    document.body,
  );
}

/** Abre el diálogo de impresión del navegador solo con las etiquetas. */
export function imprimirEtiquetas() {
  const quitar = () => {
    document.body.classList.remove(CLASE_IMPRIMIENDO);
    window.removeEventListener("afterprint", quitar);
  };
  document.body.classList.add(CLASE_IMPRIMIENDO);
  window.addEventListener("afterprint", quitar);
  window.print();
}

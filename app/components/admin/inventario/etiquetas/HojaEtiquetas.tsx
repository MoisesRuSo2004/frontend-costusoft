"use client";

import { createPortal } from "react-dom";
import type { InsumoResponse } from "@/app/types/insumo";
import EtiquetaInsumo from "./EtiquetaInsumo";
import { TAMANOS, porHoja, type TamanoEtiqueta } from "./etiquetaQr";

const ID_ZONA = "zona-impresion-etiquetas";

/** Repite cada insumo `copias` veces y reparte las etiquetas en hojas carta. */
export function repartirEnHojas(insumos: InsumoResponse[], copias: number, tamano: TamanoEtiqueta) {
  const etiquetas = insumos.flatMap((i) => Array.from({ length: copias }, () => i));
  const capacidad = porHoja(tamano);
  const hojas: InsumoResponse[][] = [];
  for (let i = 0; i < etiquetas.length; i += capacidad) hojas.push(etiquetas.slice(i, i + capacidad));
  return hojas;
}

/** Una hoja carta con su cuadrícula de etiquetas (todo con estilos en línea). */
export function Hoja({ etiquetas, tamano }: { etiquetas: InsumoResponse[]; tamano: TamanoEtiqueta }) {
  const t = TAMANOS[tamano];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${t.columnas}, ${t.ancho}mm)`,
      gridAutoRows: `${t.alto}mm`, justifyContent: "center", alignContent: "start",
    }}>
      {etiquetas.map((insumo, i) => <EtiquetaInsumo key={`${insumo.id}-${i}`} insumo={insumo} tamano={tamano} />)}
    </div>
  );
}

/**
 * Las hojas listas para imprimir, ocultas. imprimirEtiquetas() copia su HTML
 * a un iframe aparte y lo imprime: así solo salen las etiquetas, nunca la
 * página, sin depender del CSS global.
 */
export default function HojaEtiquetas({ insumos, copias, tamano }: {
  insumos: InsumoResponse[]; copias: number; tamano: TamanoEtiqueta;
}) {
  // Solo se monta dentro de un modal abierto con un clic: siempre en el navegador.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div id={ID_ZONA} aria-hidden style={{ display: "none" }}>
      {repartirEnHojas(insumos, copias, tamano).map((etiquetas, i) => (
        <div key={i} className="hoja-impresion"><Hoja etiquetas={etiquetas} tamano={tamano} /></div>
      ))}
    </div>,
    document.body,
  );
}

const ESTILOS_IMPRESION = `
  @page { size: letter; margin: 10mm; }
  html, body { margin: 0; padding: 0; background: #fff; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .hoja-impresion { break-after: page; }
  .hoja-impresion:last-child { break-after: auto; }
`;

/** Imprime solo las hojas de etiquetas, desde un iframe invisible. */
export async function imprimirEtiquetas() {
  const zona = document.getElementById(ID_ZONA);
  if (!zona) return;

  const marco = document.createElement("iframe");
  marco.setAttribute("aria-hidden", "true");
  marco.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(marco);
  const doc = marco.contentDocument;
  const ventana = marco.contentWindow;
  if (!doc || !ventana) return marco.remove();

  // Las hojas de estilo de la app solo para traer la fuente Poppins (@font-face)
  // y su variable; el diseño de las etiquetas va en línea.
  const estilos = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((e) => e.outerHTML).join("");
  doc.open();
  doc.write(`<!doctype html><html lang="es" class="${document.documentElement.className}"><head><meta charset="utf-8">`
    + `<title>Etiquetas QR · CostuSoft</title>${estilos}<style>${ESTILOS_IMPRESION}</style></head>`
    + `<body class="${document.body.className}">${zona.innerHTML}</body></html>`);
  doc.close();

  // Esperar estilos y fuentes para que no se imprima con la letra de respaldo.
  await new Promise<void>((listo) => (doc.readyState === "complete" ? listo() : ventana.addEventListener("load", () => listo(), { once: true })));
  await doc.fonts?.ready;

  const quitar = () => setTimeout(() => marco.remove(), 500);
  ventana.addEventListener("afterprint", quitar, { once: true });
  ventana.focus();
  ventana.print();
  setTimeout(() => marco.isConnected && marco.remove(), 60_000); // por si afterprint no llega
}

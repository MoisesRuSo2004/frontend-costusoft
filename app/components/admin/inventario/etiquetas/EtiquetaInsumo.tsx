"use client";

import { QRCodeSVG } from "qrcode.react";
import type { InsumoResponse } from "@/app/types/insumo";
import { TAMANOS, codigoQrDeInsumo, type TamanoEtiqueta } from "./etiquetaQr";

const AZUL = "#0b3d91";
const FUENTE = "var(--font-poppins), sans-serif";

/** Tamaños de letra (en puntos, para que se impriman igual en cualquier pantalla). */
const LETRA: Record<TamanoEtiqueta, { marca: number; nombre: number; detalle: number }> = {
  pequena: { marca: 5.5, nombre: 7.5, detalle: 6 },
  mediana: { marca: 6.5, nombre: 9.5, detalle: 7 },
  grande: { marca: 8, nombre: 12, detalle: 8.5 },
};

/**
 * Una etiqueta tal como se imprime (medidas en mm). El borde punteado es la
 * guía de corte. La corrección de errores "M" deja leer el QR aunque la
 * etiqueta se raye o se arrugue un poco, y el margen blanco de 2 módulos lo
 * separa del texto para que el lector lo encuentre rápido.
 */
export default function EtiquetaInsumo({ insumo, tamano }: { insumo: InsumoResponse; tamano: TamanoEtiqueta }) {
  const t = TAMANOS[tamano];
  const letra = LETRA[tamano];
  return (
    <div
      className="etiqueta-insumo"
      style={{
        width: `${t.ancho}mm`, height: `${t.alto}mm`, boxSizing: "border-box",
        padding: tamano === "pequena" ? "2.5mm" : "3.5mm",
        border: "0.3mm dashed #c4c9d4", backgroundColor: "#fff",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
        fontFamily: FUENTE, color: "#101828", overflow: "hidden", breakInside: "avoid",
      }}
    >
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: `${letra.marca}pt`, lineHeight: 1.1 }}>
        <span style={{ fontWeight: 600, color: AZUL, letterSpacing: "0.04em" }}>COSTUSOFT</span>
        <span style={{ color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em" }}>{insumo.tipo}</span>
      </div>

      <QRCodeSVG
        value={codigoQrDeInsumo(insumo.id)}
        level="M"
        marginSize={2}
        fgColor={AZUL}
        bgColor="#ffffff"
        style={{ width: `${t.qr}mm`, height: `${t.qr}mm`, flexShrink: 0 }}
        title={`Código QR de ${insumo.nombre}`}
      />

      <div style={{ width: "100%", textAlign: "center" }}>
        <p style={{
          margin: 0, fontSize: `${letra.nombre}pt`, fontWeight: 600, lineHeight: 1.15,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {insumo.nombre}
        </p>
        <p style={{ margin: "0.6mm 0 0", fontSize: `${letra.detalle}pt`, color: "#667085", lineHeight: 1.1 }}>
          Código {insumo.id} · {insumo.unidadMedida}
        </p>
      </div>
    </div>
  );
}

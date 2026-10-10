"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, QrCode, Smartphone, X } from "lucide-react";
import type { InsumoResponse } from "@/app/types/insumo";
import EtiquetaInsumo from "./EtiquetaInsumo";
import HojaEtiquetas, { imprimirEtiquetas } from "./HojaEtiquetas";
import { AZUL, Etiqueta, FUENTE, SelectorCopias, SelectorTamano } from "./controles";
import { descargarEtiquetaPng } from "./descargarPng";
import { codigoQrDeInsumo, porHoja, type TamanoEtiqueta } from "./etiquetaQr";

/** Etiqueta QR de un insumo: vista previa, impresión y descarga en PNG. */
export default function EtiquetaQrModal({ insumo, onClose }: { insumo: InsumoResponse; onClose: () => void }) {
  const [tamano, setTamano] = useState<TamanoEtiqueta>("mediana");
  const [copias, setCopias] = useState(1);
  const qrAlta = useRef<HTMLCanvasElement>(null);
  const maximo = porHoja(tamano);
  const hojas = Math.ceil(copias / maximo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }} role="dialog" aria-modal aria-labelledby="titulo-etiqueta"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border p-6"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(11,61,145,0.08)" }}>
              <QrCode size={18} style={{ color: AZUL }} />
            </div>
            <div>
              <h3 id="titulo-etiqueta" className="text-base font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>
                Etiqueta QR
              </h3>
              <p className="text-xs" style={{ color: "#9ca3af", fontFamily: FUENTE }}>{insumo.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-xl transition"
            style={{ color: "#9ca3af" }}>
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
          {/* Vista previa a tamaño real */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center rounded-2xl p-4" style={{ backgroundColor: "#f4f6fa", minWidth: 260, minHeight: 260 }}>
              <EtiquetaInsumo insumo={insumo} tamano={tamano} />
            </div>
            <p className="text-[11px]" style={{ color: "#98a2b3", fontFamily: FUENTE }}>Vista previa a tamaño real</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Etiqueta>Tamaño</Etiqueta>
              <SelectorTamano valor={tamano} alCambiar={(t) => { setTamano(t); setCopias((c) => Math.min(c, porHoja(t))); }} />
            </div>
            <div>
              <Etiqueta>Copias</Etiqueta>
              <div className="flex items-center gap-3">
                <SelectorCopias valor={copias} maximo={maximo} alCambiar={setCopias} />
                <span className="text-xs" style={{ color: "#667085", fontFamily: FUENTE }}>
                  {hojas} hoja carta · hasta {maximo}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl border px-3.5 py-3"
              style={{ borderColor: "#dbe4ff", backgroundColor: "rgba(11,61,145,0.04)" }}>
              <Smartphone size={15} className="mt-0.5 flex-shrink-0" style={{ color: AZUL }} />
              <p className="text-xs leading-relaxed" style={{ color: "#475467", fontFamily: FUENTE }}>
                Bodega la escanea desde la app móvil para ver el insumo y sus movimientos.
                <span className="mt-1 block font-mono text-[11px]" style={{ color: "#98a2b3" }}>{codigoQrDeInsumo(insumo.id)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={() => qrAlta.current && descargarEtiquetaPng(insumo, qrAlta.current)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: FUENTE }}>
            <Download size={15} /> Descargar PNG
          </button>
          <button onClick={imprimirEtiquetas}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition"
            style={{ backgroundColor: AZUL, fontFamily: FUENTE }}>
            <Printer size={15} /> Imprimir {copias > 1 ? `${copias} etiquetas` : "etiqueta"}
          </button>
        </div>

        {/* QR en alta resolución para el PNG (no se muestra) */}
        <QRCodeCanvas ref={qrAlta} value={codigoQrDeInsumo(insumo.id)} level="M" marginSize={0} size={720}
          fgColor={AZUL} bgColor="#ffffff" style={{ display: "none" }} />
        <HojaEtiquetas insumos={[insumo]} copias={copias} tamano={tamano} />
      </motion.div>
    </div>
  );
}

/**
 * Etiquetas QR de insumos.
 *
 * El contenido del QR es el mismo que genera y lee la app móvil
 * (lib/modulos/bodega/dominio/codigo_qr.dart): lo que se imprime aquí lo
 * escanea Bodega desde el celular sin ningún cambio.
 */

export const codigoQrDeInsumo = (insumoId: number) => `costusoft://insumo/${insumoId}`;

export type TamanoEtiqueta = "pequena" | "mediana" | "grande";

/** Medidas en milímetros sobre una hoja carta (216 × 279 mm, márgenes de 10 mm). */
export const TAMANOS: Record<TamanoEtiqueta, { etiqueta: string; detalle: string; columnas: number; ancho: number; alto: number; qr: number }> = {
  pequena: { etiqueta: "Pequeña", detalle: "4 × 6 por hoja · cajas y frascos", columnas: 4, ancho: 49, alto: 42, qr: 26 },
  mediana: { etiqueta: "Mediana", detalle: "3 × 4 por hoja · estantes", columnas: 3, ancho: 65, alto: 64, qr: 40 },
  grande: { etiqueta: "Grande", detalle: "2 × 3 por hoja · rollos de tela", columnas: 2, ancho: 98, alto: 86, qr: 56 },
};

export const porHoja = (tamano: TamanoEtiqueta) => {
  const t = TAMANOS[tamano];
  return t.columnas * Math.floor(259 / t.alto);
};

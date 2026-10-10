import type { InsumoResponse } from "@/app/types/insumo";

const ANCHO = 1000;
const ALTO = 1240;
const AZUL = "#0b3d91";

/** Parte un texto en líneas que quepan en `ancho` (máximo `maxLineas`, con "…"). */
function lineas(ctx: CanvasRenderingContext2D, texto: string, ancho: number, maxLineas: number) {
  const palabras = texto.split(/\s+/);
  const resultado: string[] = [];
  let actual = "";
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width <= ancho || !actual) actual = prueba;
    else {
      resultado.push(actual);
      actual = palabra;
    }
  }
  if (actual) resultado.push(actual);
  if (resultado.length > maxLineas) {
    const recortadas = resultado.slice(0, maxLineas);
    let ultima = recortadas[maxLineas - 1];
    while (ultima.length > 1 && ctx.measureText(`${ultima}…`).width > ancho) ultima = ultima.slice(0, -1);
    recortadas[maxLineas - 1] = `${ultima.trimEnd()}…`;
    return recortadas;
  }
  return resultado;
}

/**
 * Descarga la etiqueta como PNG (para mandarla a imprimir a otro lado o
 * compartirla). `qr` es el canvas del QR ya dibujado por qrcode.react.
 */
export function descargarEtiquetaPng(insumo: InsumoResponse, qr: HTMLCanvasElement) {
  const lienzo = document.createElement("canvas");
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext("2d");
  if (!ctx) return;
  // La misma Poppins que usa la página (next/font le da un nombre propio).
  const fuente = getComputedStyle(document.body).fontFamily || "sans-serif";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ANCHO, ALTO);

  ctx.textBaseline = "alphabetic";
  ctx.font = `600 34px ${fuente}`;
  ctx.fillStyle = AZUL;
  ctx.textAlign = "left";
  ctx.fillText("COSTUSOFT", 70, 100);
  ctx.font = `400 34px ${fuente}`;
  ctx.fillStyle = "#667085";
  ctx.textAlign = "right";
  ctx.fillText(insumo.tipo.toUpperCase(), ANCHO - 70, 100);

  const lado = 720;
  ctx.imageSmoothingEnabled = false; // bordes nítidos en los módulos del QR
  ctx.drawImage(qr, (ANCHO - lado) / 2, 150, lado, lado);

  ctx.textAlign = "center";
  ctx.fillStyle = "#101828";
  ctx.font = `600 58px ${fuente}`;
  const nombre = lineas(ctx, insumo.nombre, ANCHO - 140, 2);
  nombre.forEach((linea, i) => ctx.fillText(linea, ANCHO / 2, 960 + i * 70));
  ctx.font = `400 38px ${fuente}`;
  ctx.fillStyle = "#667085";
  ctx.fillText(`Código ${insumo.id} · ${insumo.unidadMedida}`, ANCHO / 2, 960 + nombre.length * 70 + 40);

  const enlace = document.createElement("a");
  const nombreArchivo = insumo.nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  enlace.download = `etiqueta-${insumo.id}-${nombreArchivo}.png`;
  enlace.href = lienzo.toDataURL("image/png");
  enlace.click();
}

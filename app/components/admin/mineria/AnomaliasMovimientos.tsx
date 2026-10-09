"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, FlaskConical, Info, LoaderCircle, Radar, ScanSearch, ShieldCheck, TriangleAlert,
} from "lucide-react";
import MapaAnomalias, { COLOR_NIVEL } from "./MapaAnomalias";
import { Campo, FUENTE, Pastilla, Segmentado, SelectorInsumos, VIOLETA, aFecha, conUnidad, fechaLarga, numero, tarjeta, veces } from "./ui";
import { useAnomalias, useCatalogoMineria } from "@/app/hooks/useMineria";
import {
  NOMBRE_METODO,
  NOMBRE_TIPO_ANOMALIA,
  type AnomaliaMovimiento,
  type AnomaliasResponse,
  type Sensibilidad,
  type TipoAnomalia,
  type TipoMovimientoAnalisis,
} from "@/app/types/mineria";

const TIPOS: { valor: TipoMovimientoAnalisis; etiqueta: string }[] = [
  { valor: "salidas", etiqueta: "Salidas" },
  { valor: "entradas", etiqueta: "Entradas" },
  { valor: "ambos", etiqueta: "Ambos" },
];
const SENSIBILIDADES: { valor: Sensibilidad; etiqueta: string }[] = [
  { valor: "baja", etiqueta: "Baja" },
  { valor: "media", etiqueta: "Media" },
  { valor: "alta", etiqueta: "Alta" },
];
const AYUDA_SENSIBILIDAD: Record<Sensibilidad, string> = {
  baja: "Solo lo muy evidente: pocas alertas, casi todas relevantes.",
  media: "Equilibrio entre detectar y no molestar (recomendada).",
  alta: "Revisa más a fondo: más alertas, incluidas algunas normales.",
};
/** Periodos rápidos, en meses antes de la fecha de corte de los datos. */
const PERIODOS = [3, 6, 12, 24];
const POR_PAGINA = 12;

const restarMeses = (fecha: string, meses: number) => {
  const f = aFecha(fecha);
  f.setMonth(f.getMonth() - meses);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
};

/**
 * Detección de anomalías en los movimientos del inventario: lo que se aleja
 * de lo habitual para cada insumo, con tres métodos y su validación.
 */
export default function AnomaliasMovimientos() {
  const catalogo = useCatalogoMineria();
  const { resultado, analizando, error, analizar } = useAnomalias();

  const [tipo, setTipo] = useState<TipoMovimientoAnalisis>("salidas");
  const [sensibilidad, setSensibilidad] = useState<Sensibilidad>("media");
  const [meses, setMeses] = useState<number | null>(12);
  const [insumoIds, setInsumoIds] = useState<number[]>([]);
  const [filtroNivel, setFiltroNivel] = useState<"todas" | "alta" | "media">("todas");
  const [filtroTipo, setFiltroTipo] = useState<TipoAnomalia | null>(null);
  const [pagina, setPagina] = useState(0);
  const [seleccionada, setSeleccionada] = useState<AnomaliaMovimiento | null>(null);

  // La fecha de corte la informa el primer análisis (último movimiento registrado).
  const corte = resultado?.hasta ?? null;

  const ejecutar = (cambios?: { meses?: number | null }) => {
    const mesesElegidos = cambios?.meses !== undefined ? cambios.meses : meses;
    analizar({
      tipo,
      sensibilidad,
      insumoIds: insumoIds.length ? insumoIds : null,
      hasta: corte,
      desde: corte && mesesElegidos ? restarMeses(corte, mesesElegidos) : corte ? "2000-01-01" : null,
      limite: 300,
      validar: true,
    });
    setPagina(0);
    setSeleccionada(null);
  };

  // Primer análisis automático: últimos 12 meses de salidas, sensibilidad media.
  useEffect(() => {
    analizar({ tipo: "salidas", sensibilidad: "media", limite: 300, validar: true });
  }, [analizar]);

  const visibles = useMemo(() => (resultado?.anomalias ?? []).filter((a) =>
    (filtroNivel === "todas" || a.nivel === filtroNivel) && (!filtroTipo || a.tipo_anomalia === filtroTipo)),
  [resultado, filtroNivel, filtroTipo]);
  const paginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const enPagina = visibles.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  return (
    <div className="flex flex-col gap-5">
      {/* ── FILTROS ──────────────────────────────────────────────────── */}
      <section style={{ ...tarjeta, padding: 22 }}>
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-2 xl:flex xl:flex-wrap xl:items-start xl:justify-between">
          <Campo titulo="Periodo" ayuda={corte ? `Hasta el último movimiento registrado (${fechaLarga(corte)}).` : undefined}>
            <div className="flex flex-wrap gap-1.5">
              {PERIODOS.map((m) => (
                <Pastilla key={m} activa={meses === m} alTocar={() => setMeses(m)}>{m < 12 ? `${m} meses` : m === 12 ? "1 año" : "2 años"}</Pastilla>
              ))}
              <Pastilla activa={meses === null} alTocar={() => setMeses(null)}>Todo</Pastilla>
            </div>
          </Campo>
          <Campo titulo="Movimientos">
            <Segmentado opciones={TIPOS} valor={tipo} alCambiar={setTipo} />
          </Campo>
          <Campo titulo="Sensibilidad" ayuda={AYUDA_SENSIBILIDAD[sensibilidad]}>
            <Segmentado opciones={SENSIBILIDADES} valor={sensibilidad} alCambiar={setSensibilidad} />
          </Campo>
        </div>
        <div className="mt-4">
          <Campo titulo="Insumos (opcional)" ayuda="Sin elegir ninguno se revisan todos.">
            <SelectorInsumos insumos={catalogo.insumos} cargando={catalogo.cargando} elegidos={insumoIds}
              colorDe={() => VIOLETA} alCambiar={setInsumoIds} maximo={10} placeholder="Todos los insumos" />
          </Campo>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "#f0f2f5" }}>
          <p className="flex items-center gap-1.5 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
            <Info size={13} />
            Una anomalía no es un fraude: es un movimiento que se aleja de lo habitual y merece revisión.
          </p>
          <button type="button" onClick={() => ejecutar()} disabled={analizando}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: VIOLETA, fontFamily: FUENTE, boxShadow: "0 6px 16px rgba(124,58,237,0.25)" }}>
            {analizando ? <LoaderCircle size={16} className="animate-spin" /> : <ScanSearch size={16} />}
            {analizando ? "Analizando…" : "Analizar movimientos"}
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border px-5 py-4" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
          <TriangleAlert size={18} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm" style={{ color: "#991b1b", fontFamily: FUENTE }}>{error}</p>
        </div>
      )}

      {!resultado && analizando && (
        <div className="flex flex-col items-center gap-3 py-14">
          <LoaderCircle size={28} className="animate-spin" style={{ color: VIOLETA }} />
          <p className="text-sm" style={{ color: "#667085", fontFamily: FUENTE }}>Revisando movimientos con tres métodos…</p>
        </div>
      )}

      {resultado && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: analizando ? 0.55 : 1, y: 0 }} className="flex flex-col gap-5">
          <Resumen resultado={resultado} />

          <section style={{ ...tarjeta, padding: "18px 20px" }}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>
                  <Radar size={16} style={{ color: VIOLETA }} /> Mapa de anomalías
                </h3>
                <p className="mt-0.5 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
                  {fechaLarga(resultado.desde)} – {fechaLarga(resultado.hasta)} · arriba: cantidades mayores a lo habitual · abajo: menores. Toca un punto para verlo en la lista.
                </p>
              </div>
              <div className="flex gap-3 text-xs" style={{ fontFamily: FUENTE, color: "#475467" }}>
                {(["alta", "media"] as const).map((n) => (
                  <span key={n} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLOR_NIVEL[n] }} /> Alerta {n}
                  </span>
                ))}
              </div>
            </div>
            {resultado.anomalias.length ? (
              <MapaAnomalias anomalias={resultado.anomalias} desde={resultado.desde} hasta={resultado.hasta}
                seleccionada={seleccionada}
                alElegir={(a) => {
                  setFiltroNivel("todas");
                  setFiltroTipo(null);
                  setSeleccionada(a);
                  const indice = resultado.anomalias.indexOf(a);
                  setPagina(Math.floor(indice / POR_PAGINA));
                }} />
            ) : (
              <SinAlertas />
            )}
          </section>

          {resultado.anomalias.length > 0 && (
            <section style={{ ...tarjeta, padding: "18px 20px" }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h3 className="mr-auto text-[15px] font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>
                  Movimientos para revisar
                  <span className="ml-2 text-xs font-normal" style={{ color: "#98a2b3" }}>
                    {visibles.length} de {resultado.anomalias.length}
                  </span>
                </h3>
                {(["todas", "alta", "media"] as const).map((n) => (
                  <Pastilla key={n} activa={filtroNivel === n} alTocar={() => { setFiltroNivel(n); setPagina(0); }}>
                    {n === "todas" ? "Todas" : `Alerta ${n}`}
                  </Pastilla>
                ))}
                {(Object.keys(resultado.resumen.por_tipo) as TipoAnomalia[]).map((t) => (
                  <Pastilla key={t} activa={filtroTipo === t} alTocar={() => { setFiltroTipo(filtroTipo === t ? null : t); setPagina(0); }}>
                    {NOMBRE_TIPO_ANOMALIA[t]} · {resultado.resumen.por_tipo[t]}
                  </Pastilla>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                <AnimatePresence initial={false}>
                  {enPagina.map((a) => (
                    <FilaAnomalia key={`${a.movimiento}-${a.renglon_id}`} anomalia={a}
                      activa={seleccionada?.renglon_id === a.renglon_id && seleccionada.movimiento === a.movimiento}
                      alTocar={() => setSeleccionada(seleccionada === a ? null : a)} />
                  ))}
                </AnimatePresence>
              </div>
              {paginas > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2 text-xs" style={{ color: "#667085", fontFamily: FUENTE }}>
                  Página {pagina + 1} de {paginas}
                  <BotonPagina disabled={pagina === 0} alTocar={() => setPagina(pagina - 1)}><ChevronLeft size={15} /></BotonPagina>
                  <BotonPagina disabled={pagina >= paginas - 1} alTocar={() => setPagina(pagina + 1)}><ChevronRight size={15} /></BotonPagina>
                </div>
              )}
            </section>
          )}

          {resultado.validacion && <Validacion validacion={resultado.validacion} />}
        </motion.div>
      )}
    </div>
  );
}

// ── Resumen ──────────────────────────────────────────────────────────────────

function Resumen({ resultado }: { resultado: AnomaliasResponse }) {
  const { movimientos_analizados: total, alta, media } = resultado.resumen;
  const tasa = total ? ((alta + media) / total) * 100 : 0;
  const tarjetas = [
    { etiqueta: "Movimientos revisados", valor: numero.format(total), color: VIOLETA, fondo: "#f5f3ff" },
    { etiqueta: "Alertas altas", valor: numero.format(alta), color: COLOR_NIVEL.alta, fondo: "#fef2f2" },
    { etiqueta: "Alertas medias", valor: numero.format(media), color: COLOR_NIVEL.media, fondo: "#fffbeb" },
    { etiqueta: "Proporción con alerta", valor: `${numero.format(tasa)} %`, color: "#0891b2", fondo: "#ecfeff" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tarjetas.map((t, i) => (
        <motion.div key={t.etiqueta} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="rounded-2xl px-5 py-4" style={{ ...tarjeta, borderLeft: `4px solid ${t.color}` }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: t.color, fontFamily: FUENTE }}>{t.etiqueta}</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "#101828", fontFamily: FUENTE }}>{t.valor}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Fila de anomalía ─────────────────────────────────────────────────────────

function FilaAnomalia({ anomalia: a, activa, alTocar }: { anomalia: AnomaliaMovimiento; activa: boolean; alTocar: () => void }) {
  const color = COLOR_NIVEL[a.nivel];
  return (
    <motion.button type="button" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={alTocar}
      className="grid w-full gap-3 rounded-2xl border p-3.5 text-left transition-colors md:grid-cols-[auto_1fr_220px]"
      style={{ borderColor: activa ? color : "#eef0f4", backgroundColor: activa ? `${color}0d` : "#fff", fontFamily: FUENTE }}>
      <span className="flex h-fit items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{ backgroundColor: `${color}14`, color }}>
        <TriangleAlert size={12} /> {a.nivel === "alta" ? "Alta" : "Media"}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[14px] font-semibold" style={{ color: "#101828" }}>{a.insumo}</span>
          <span className="text-[11.5px]" style={{ color: "#98a2b3" }}>{NOMBRE_TIPO_ANOMALIA[a.tipo_anomalia]}</span>
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: "#475467" }}>{a.razon}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]" style={{ color: "#98a2b3" }}>
          <span>{fechaLarga(a.fecha)}</span>·
          <span>{a.movimiento === "SALIDA" ? "Salida" : "Entrada"} #{a.movimiento_id}</span>
          {a.tercero && <>·<span>{a.tercero}</span></>}
          {a.metodos.map((m) => (
            <span key={m} className="rounded-md px-1.5 py-0.5" style={{ backgroundColor: "#f4f4f7", color: "#475467" }}>
              {NOMBRE_METODO[m]}
            </span>
          ))}
        </span>
        {activa && a.descripcion && (
          <span className="mt-2 block rounded-lg px-2.5 py-1.5 text-[12px]" style={{ backgroundColor: "#f9fafb", color: "#475467" }}>
            {a.descripcion}
          </span>
        )}
      </span>
      <RangoHabitual anomalia={a} color={color} />
    </motion.button>
  );
}

/** Barra con el rango habitual (percentiles 10–90), la mediana y dónde cayó el movimiento. */
function RangoHabitual({ anomalia: a, color }: { anomalia: AnomaliaMovimiento; color: string }) {
  const [p10, p90] = a.rango_habitual;
  const maximo = Math.max(p90, a.cantidad, a.mediana_habitual) * 1.15 || 1;
  const pos = (v: number) => `${Math.min(100, (v / maximo) * 100)}%`;
  return (
    <span className="block self-center">
      <span className="flex justify-between text-[11px]" style={{ color: "#98a2b3" }}>
        <span>Habitual {numero.format(p10)}–{numero.format(p90)}</span>
        <span className="font-semibold" style={{ color }}>{conUnidad(a.cantidad, a.unidad_medida)}</span>
      </span>
      <span className="relative mt-1.5 block h-2.5 rounded-full" style={{ backgroundColor: "#f0f2f5" }}>
        <span className="absolute top-0 h-2.5 rounded-full" style={{ left: pos(p10), width: `calc(${pos(p90)} - ${pos(p10)})`, backgroundColor: "#d0d5dd" }} />
        <span className="absolute -top-0.5 h-3.5 w-0.5 rounded" style={{ left: pos(a.mediana_habitual), backgroundColor: "#667085" }} />
        <span className="absolute -translate-x-1/2 rounded-full border-2 border-white shadow"
          style={{ left: pos(a.cantidad), backgroundColor: color, width: 14, height: 14, top: -2 }} />
      </span>
      <span className="mt-1 block text-right text-[11px]" style={{ color: "#98a2b3" }}>
        {veces(a.veces_mediana)} la mediana
      </span>
    </span>
  );
}

// ── Validación del detector ─────────────────────────────────────────────────

function Validacion({ validacion }: { validacion: NonNullable<AnomaliasResponse["validacion"]> }) {
  const tipos: { clave: "alta" | "baja" | "rafaga"; etiqueta: string }[] = [
    { clave: "alta", etiqueta: "Cantidad alta" },
    { clave: "baja", etiqueta: "Cantidad baja" },
    { clave: "rafaga", etiqueta: "Ráfagas" },
  ];
  const alertas = validacion.metricas.find((m) => m.metodo === "alertas");
  return (
    <section style={{ ...tarjeta, padding: "18px 20px" }}>
      <h3 className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>
        <ShieldCheck size={16} style={{ color: VIOLETA }} /> ¿Qué tan confiable es el detector?
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "#667085", fontFamily: FUENTE }}>
        <FlaskConical size={13} className="mr-1 inline" style={{ color: VIOLETA }} />
        En una copia en memoria de {numero.format(validacion.movimientos_evaluados)} movimientos se insertaron{" "}
        <strong>{validacion.anomalias_inyectadas} anomalías simuladas</strong> (cantidades muy altas, muy bajas y ráfagas)
        y se midió cuántas encuentra cada método. La base de datos no se modifica.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[12.5px]" style={{ fontFamily: FUENTE }}>
          <thead>
            <tr style={{ color: "#98a2b3" }} className="text-left text-[11px] uppercase tracking-wide">
              <th className="pb-2 font-semibold">Método</th>
              <th className="pb-2 font-semibold">Precisión</th>
              <th className="pb-2 font-semibold">Recall</th>
              <th className="pb-2 font-semibold">F1</th>
              <th className="pb-2 font-semibold">Falsas alarmas</th>
              {tipos.map((t) => <th key={t.clave} className="pb-2 font-semibold">{t.etiqueta}</th>)}
            </tr>
          </thead>
          <tbody>
            {validacion.metricas.map((m) => {
              const sistema = m.metodo === "alertas";
              return (
                <tr key={m.metodo} className="border-t" style={{ borderColor: "#f0f2f5", backgroundColor: sistema ? "#faf8ff" : undefined }}>
                  <td className="py-2.5 pr-3 font-semibold" style={{ color: sistema ? VIOLETA : "#344054" }}>{m.nombre}</td>
                  <td className="py-2.5 pr-3" style={{ color: "#101828" }}>{numero.format(m.precision)} %</td>
                  <td className="py-2.5 pr-3" style={{ color: "#101828" }}>{numero.format(m.recall)} %</td>
                  <td className="py-2.5 pr-3" style={{ color: "#101828" }}>{numero.format(m.f1)} %</td>
                  <td className="py-2.5 pr-3" style={{ color: "#667085" }}>{numero.format(m.falsas_alarmas)}</td>
                  {tipos.map((t) => <td key={t.clave} className="py-2.5 pr-3"><BarraPorcentaje valor={m.recall_por_tipo[t.clave]} /></td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {alertas && (
        <div className="mt-4 grid gap-2 text-[12.5px] leading-relaxed md:grid-cols-3" style={{ fontFamily: FUENTE, color: "#475467" }}>
          <Lectura titulo="Precisión">De cada 100 alertas, cuántas eran de verdad anomalías.</Lectura>
          <Lectura titulo="Recall">De las anomalías que había, cuántas encontró.</Lectura>
          <Lectura titulo="Lectura honesta">
            Las cantidades atípicas se detectan casi siempre ({numero.format(alertas.recall_por_tipo.alta)} % altas, {numero.format(alertas.recall_por_tipo.baja)} % bajas).
            Las ráfagas casi no ({numero.format(alertas.recall_por_tipo.rafaga)} %): en estos datos, repetir un insumo varias veces en pocos días ya es frecuente.
          </Lectura>
        </div>
      )}
    </section>
  );
}

function BarraPorcentaje({ valor }: { valor: number }) {
  const color = valor >= 80 ? "#16a34a" : valor >= 40 ? "#d97706" : "#dc2626";
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-14 rounded-full" style={{ backgroundColor: "#eef0f4" }}>
        <span className="block h-1.5 rounded-full" style={{ width: `${Math.max(3, valor)}%`, backgroundColor: color }} />
      </span>
      <span style={{ color: "#475467" }}>{numero.format(valor)} %</span>
    </span>
  );
}

function Lectura({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <p className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#f9fafb" }}>
      <strong style={{ color: "#344054" }}>{titulo}:</strong> {children}
    </p>
  );
}

function SinAlertas() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl py-12" style={{ backgroundColor: "#f0fdf4" }}>
      <ShieldCheck size={28} style={{ color: "#16a34a" }} />
      <p className="text-sm font-semibold" style={{ color: "#14532d", fontFamily: FUENTE }}>Sin movimientos atípicos en este periodo</p>
      <p className="text-xs" style={{ color: "#15803d", fontFamily: FUENTE }}>Prueba con un periodo más largo o una sensibilidad más alta.</p>
    </div>
  );
}

function BotonPagina({ disabled, alTocar, children }: { disabled: boolean; alTocar: () => void; children: React.ReactNode }) {
  return (
    <button type="button" disabled={disabled} onClick={alTocar}
      className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
      style={{ borderColor: "#e5e7eb", color: "#475467" }}>
      {children}
    </button>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock, ChartLine, ChevronDown, FlaskConical, Info, LoaderCircle, PackageSearch,
  Plus, Search, ShoppingCart, Sparkles, TriangleAlert, Trophy, Truck, X,
} from "lucide-react";
import GraficaTemporal, { type SerieGrafica } from "./GraficaTemporal";
import { useCatalogoMineria, usePronostico } from "@/app/hooks/useMineria";
import {
  NOMBRE_MODELO,
  type Agrupacion,
  type PrendaEscenarioRequest,
  type PronosticoInsumo,
} from "@/app/types/mineria";
import type { UniformeResponse } from "@/app/types/uniforme";

// ── Estilo ────────────────────────────────────────────────────────────────────

const FUENTE = "'Poppins', sans-serif";
const VIOLETA = "#7c3aed";
/** Un color por insumo, en el orden en que se eligen. */
const COLORES = ["#7c3aed", "#0891b2", "#ea580c", "#16a34a", "#db2777"];
const HORIZONTES = [30, 60, 90, 180, 365];
const AGRUPACIONES: { valor: Agrupacion; etiqueta: string }[] = [
  { valor: "dia", etiqueta: "Día" },
  { valor: "semana", etiqueta: "Semana" },
  { valor: "mes", etiqueta: "Mes" },
];
const MAX_INSUMOS = 5;

const numero = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const aFecha = (texto: string) => {
  const [a, m, d] = texto.split("-").map(Number);
  return new Date(a, m - 1, d);
};
const fechaLarga = (texto: string | null) =>
  texto ? aFecha(texto).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fechaMes = new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" });

const tarjeta: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 20,
  border: "1px solid #eef0f4",
  boxShadow: "0 1px 12px rgba(16,24,40,0.05)",
};

interface PrendaElegida extends PrendaEscenarioRequest {
  etiqueta: string;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function PronosticoDinamico() {
  const catalogo = useCatalogoMineria();
  const { resultado, calculando, error, calcular } = usePronostico();

  const [insumoIds, setInsumoIds] = useState<number[]>([]);
  const [horizonte, setHorizonte] = useState(90);
  // Por mes por defecto: es la escala en que se modela el consumo.
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("mes");
  const [plazo, setPlazo] = useState(7);
  const [conEscenario, setConEscenario] = useState(false);
  const [prendas, setPrendas] = useState<PrendaElegida[]>([]);

  const colorDe = (id: number) => COLORES[Math.max(0, insumoIds.indexOf(id)) % COLORES.length];

  const ejecutar = () => {
    if (insumoIds.length === 0) return;
    calcular({
      insumoIds,
      horizonteDias: horizonte,
      agrupacion,
      plazoProveedorDias: plazo,
      escenario: conEscenario && prendas.length
        ? { prendas: prendas.map(({ uniformeId, talla, cantidad }) => ({ uniformeId, talla, cantidad })) }
        : null,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── PARÁMETROS ───────────────────────────────────────────────── */}
      <section style={{ ...tarjeta, padding: 22 }}>
        <div className="flex flex-col gap-5">
          <Campo titulo="¿Qué insumos quieres predecir?" ayuda={`Hasta ${MAX_INSUMOS} para compararlos en la misma gráfica.`}>
            <SelectorInsumos
              insumos={catalogo.insumos}
              cargando={catalogo.cargando}
              elegidos={insumoIds}
              colorDe={colorDe}
              alCambiar={setInsumoIds}
            />
          </Campo>

          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2 xl:flex xl:flex-wrap xl:items-start xl:justify-between">
            <Campo titulo="Horizonte">
              <div className="flex flex-wrap gap-1.5 xl:flex-nowrap">
                {HORIZONTES.map((d) => (
                  <Pastilla key={d} activa={horizonte === d} alTocar={() => setHorizonte(d)}>
                    {d === 365 ? "1 año" : `${d} días`}
                  </Pastilla>
                ))}
              </div>
            </Campo>
            <Campo titulo="Ver por">
              <div className="inline-flex rounded-xl p-1" style={{ backgroundColor: "#f4f4f7" }}>
                {AGRUPACIONES.map((a) => (
                  <button key={a.valor} type="button" onClick={() => setAgrupacion(a.valor)}
                    className="rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all"
                    style={{
                      fontFamily: FUENTE,
                      color: agrupacion === a.valor ? VIOLETA : "#667085",
                      backgroundColor: agrupacion === a.valor ? "#fff" : "transparent",
                      boxShadow: agrupacion === a.valor ? "0 1px 4px rgba(16,24,40,0.1)" : "none",
                    }}>
                    {a.etiqueta}
                  </button>
                ))}
              </div>
            </Campo>
            <Campo titulo="Plazo del proveedor" ayuda="Días que tarda en llegar una compra.">
              <div className="flex items-center gap-2">
                <Truck size={16} style={{ color: "#98a2b3" }} />
                <input type="number" min={0} max={90} value={plazo}
                  onChange={(e) => setPlazo(Math.min(90, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-20 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{ borderColor: "#e5e7eb", fontFamily: FUENTE, color: "#344054" }} />
                <span className="text-sm" style={{ color: "#667085", fontFamily: FUENTE }}>días</span>
              </div>
            </Campo>
            <Campo titulo="Escenario">
              <label className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-[13px]" style={{ color: "#344054", fontFamily: FUENTE }}>
                <Interruptor activo={conEscenario} alCambiar={setConEscenario} />
                Simular un pedido (¿y si…?)
              </label>
            </Campo>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {conEscenario && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <ConstructorEscenario
                colegios={catalogo.colegios}
                uniformesDe={catalogo.uniformesDe}
                prendas={prendas}
                alCambiar={setPrendas}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: "#f0f2f5" }}>
          <p className="flex items-center gap-1.5 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
            <Info size={13} />
            Cada insumo usa el modelo que mejor predijo sus últimos 6 meses (Prophet, promedio o estacional).
          </p>
          <button type="button" onClick={ejecutar} disabled={insumoIds.length === 0 || calculando}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: VIOLETA, fontFamily: FUENTE, boxShadow: "0 6px 16px rgba(124,58,237,0.25)" }}>
            {calculando ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {calculando ? "Calculando…" : "Calcular pronóstico"}
          </button>
        </div>
      </section>

      {/* ── RESULTADOS ───────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border px-5 py-4" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
          <TriangleAlert size={18} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm" style={{ color: "#991b1b", fontFamily: FUENTE }}>{error}</p>
        </div>
      )}

      {!resultado && !calculando && !error && <EstadoInicial />}

      {resultado && (
        <motion.div key={JSON.stringify(resultado.insumos.map((i) => i.insumo_id))}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: calculando ? 0.55 : 1, y: 0 }}
          className="flex flex-col gap-5">
          {resultado.datos_desactualizados && (
            <div className="flex items-start gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb" }}>
              <CalendarClock size={18} style={{ color: "#b45309", flexShrink: 0, marginTop: 1 }} />
              <p className="text-[13px] leading-relaxed" style={{ color: "#92400e", fontFamily: FUENTE }}>
                Los movimientos registrados llegan hasta el <strong>{fechaLarga(resultado.fecha_corte)}</strong>.
                El pronóstico parte de esa fecha: tomar los días sin registros como “consumo cero” falsearía el modelo.
              </p>
            </div>
          )}

          <Graficas insumos={resultado.insumos} fechaCorte={resultado.fecha_corte}
            agrupacion={resultado.agrupacion} colorDe={colorDe} />

          <div className="grid items-start gap-4 xl:grid-cols-2">
            {resultado.insumos.map((insumo) => (
              <TarjetaInsumo key={insumo.insumo_id} insumo={insumo} color={colorDe(insumo.insumo_id)}
                horizonte={resultado.horizonte_dias} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Gráficas ──────────────────────────────────────────────────────────────────

function Graficas({ insumos, fechaCorte, agrupacion, colorDe }: {
  insumos: PronosticoInsumo[];
  fechaCorte: string;
  agrupacion: Agrupacion;
  colorDe: (id: number) => string;
}) {
  const formatoFecha = agrupacion === "mes" ? (f: Date) => fechaMes.format(f) : undefined;
  const unico = insumos.length === 1 ? insumos[0] : null;

  const consumo: SerieGrafica[] = useMemo(() => insumos.flatMap((i) => [
    { id: `h-${i.insumo_id}`, nombre: `${i.nombre} · real`, color: colorDe(i.insumo_id), unidad: i.unidad_medida, puntos: i.historial },
    {
      id: `p-${i.insumo_id}`, nombre: `${i.nombre} · pronóstico`, color: colorDe(i.insumo_id), unidad: i.unidad_medida,
      punteada: true,
      puntos: i.pronostico,
      banda: i.pronostico.map((p) => ({ fecha: p.fecha, minimo: p.minimo ?? p.valor, maximo: p.maximo ?? p.valor })),
    },
  ]), [insumos, colorDe]);

  // El stock no baja de cero en la gráfica: el faltante se ve en "Se agota" y en la compra sugerida.
  const conPiso = (puntos: PronosticoInsumo["stock_proyectado"]) => puntos.map((p) => ({ ...p, valor: Math.max(0, p.valor) }));
  const stock: SerieGrafica[] = useMemo(() => insumos.flatMap((i) => [
    { id: `s-${i.insumo_id}`, nombre: i.nombre, color: colorDe(i.insumo_id), unidad: i.unidad_medida, puntos: conPiso(i.stock_proyectado) },
    ...(i.stock_proyectado_escenario
      ? [{ id: `se-${i.insumo_id}`, nombre: `${i.nombre} · con el pedido`, color: colorDe(i.insumo_id), unidad: i.unidad_medida, punteada: true, puntos: conPiso(i.stock_proyectado_escenario) }]
      : []),
  ]), [insumos, colorDe]);

  return (
    <div className="grid gap-5 2xl:grid-cols-2">
      <section style={{ ...tarjeta, padding: "18px 20px" }}>
        <EncabezadoGrafica icono={<ChartLine size={16} />} titulo="Consumo: historial y pronóstico"
          detalle="Línea continua: lo que se consumió · punteada: lo esperado, con su banda de confianza (80 %)." />
        <GraficaTemporal series={consumo} marca={{ fecha: fechaCorte, etiqueta: "Corte" }} formatoFecha={formatoFecha}
          unidad={unico?.unidad_medida} descripcion="Consumo histórico y pronosticado de los insumos elegidos" />
        <Leyenda insumos={insumos} colorDe={colorDe} />
      </section>
      <section style={{ ...tarjeta, padding: "18px 20px" }}>
        <EncabezadoGrafica icono={<PackageSearch size={16} />} titulo="Stock proyectado"
          detalle={insumos.some((i) => i.stock_proyectado_escenario)
            ? "Línea continua: sin pedido · punteada: si se fabrica el pedido simulado."
            : "Cómo bajaría el stock si nadie compra durante el horizonte."} />
        <GraficaTemporal series={stock} formatoFecha={formatoFecha} unidad={unico?.unidad_medida}
          referencias={unico ? [{ valor: unico.stock_minimo, etiqueta: `Stock mínimo (${numero.format(unico.stock_minimo)})`, color: "#d97706" }] : []}
          descripcion="Stock proyectado de los insumos elegidos" />
        <Leyenda insumos={insumos} colorDe={colorDe} />
      </section>
    </div>
  );
}

function EncabezadoGrafica({ icono, titulo, detalle }: { icono: React.ReactNode; titulo: string; detalle: string }) {
  return (
    <div className="mb-3">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>
        <span style={{ color: VIOLETA }}>{icono}</span>{titulo}
      </h3>
      <p className="mt-0.5 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>{detalle}</p>
    </div>
  );
}

function Leyenda({ insumos, colorDe }: { insumos: PronosticoInsumo[]; colorDe: (id: number) => string }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {insumos.map((i) => (
        <span key={i.insumo_id} className="flex items-center gap-1.5 text-xs" style={{ color: "#475467", fontFamily: FUENTE }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorDe(i.insumo_id) }} />
          {i.nombre}
        </span>
      ))}
    </div>
  );
}

// ── Tarjeta de resultado por insumo ──────────────────────────────────────────

function TarjetaInsumo({ insumo, color, horizonte }: { insumo: PronosticoInsumo; color: string; horizonte: number }) {
  const [verComparacion, setVerComparacion] = useState(false);
  const compra = insumo.compra_sugerida;
  const precision = insumo.precision;
  const hayEscenario = insumo.consumo_escenario > 0;
  const unidad = insumo.unidad_medida.toLowerCase();

  return (
    <motion.article layout style={{ ...tarjeta, padding: 20, borderTop: `3px solid ${color}` }}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-[15px] font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>{insumo.nombre}</h4>
          <p className="text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
            Stock {numero.format(insumo.stock_actual)} {unidad} · mínimo {numero.format(insumo.stock_minimo)}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: "#f5f3ff", color: VIOLETA, fontFamily: FUENTE }}>
          <Trophy size={12} /> {NOMBRE_MODELO[insumo.metodo]}
        </span>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Dato etiqueta={`Consumo ${horizonte} días`}
          valor={`${numero.format(insumo.consumo_pronosticado)}`}
          extra={hayEscenario ? `+${numero.format(insumo.consumo_escenario)} del pedido` : unidad} />
        <Dato etiqueta="Llega al mínimo"
          valor={fechaLarga(hayEscenario ? insumo.fecha_alerta_escenario : insumo.fecha_alerta)}
          extra={hayEscenario && insumo.fecha_alerta !== insumo.fecha_alerta_escenario ? `sin pedido: ${fechaLarga(insumo.fecha_alerta)}` : undefined}
          alerta={Boolean(hayEscenario ? insumo.fecha_alerta_escenario : insumo.fecha_alerta)} />
        <Dato etiqueta="Se agota"
          valor={fechaLarga(hayEscenario ? insumo.fecha_agotamiento_escenario : insumo.fecha_agotamiento)}
          extra={hayEscenario && insumo.fecha_agotamiento !== insumo.fecha_agotamiento_escenario ? `sin pedido: ${fechaLarga(insumo.fecha_agotamiento)}` : undefined}
          alerta={Boolean(hayEscenario ? insumo.fecha_agotamiento_escenario : insumo.fecha_agotamiento)} />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl px-4 py-3"
        style={{ backgroundColor: compra.cantidad > 0 ? "#f0fdf4" : "#f9fafb", border: `1px solid ${compra.cantidad > 0 ? "#bbf7d0" : "#eef0f4"}` }}>
        <ShoppingCart size={18} style={{ color: compra.cantidad > 0 ? "#16a34a" : "#98a2b3", flexShrink: 0, marginTop: 2 }} />
        <div className="text-[13px]" style={{ fontFamily: FUENTE }}>
          {compra.cantidad > 0 ? (
            <p style={{ color: "#14532d" }}>
              Comprar <strong>{numero.format(compra.cantidad)} {unidad}</strong>
              {compra.fecha_limite && <> antes del <strong>{fechaLarga(compra.fecha_limite)}</strong></>}
            </p>
          ) : (
            <p style={{ color: "#475467" }}>No necesitas comprar en este horizonte.</p>
          )}
          <p className="mt-0.5 text-xs" style={{ color: "#667085" }}>{compra.motivo}</p>
        </div>
      </div>

      {precision ? (
        <div className="mt-4">
          <button type="button" onClick={() => setVerComparacion((v) => !v)}
            className="flex w-full items-center justify-between gap-3 text-left">
            <span className="text-xs" style={{ color: "#475467", fontFamily: FUENTE }}>
              <strong style={{ color: "#344054" }}>Precisión</strong> (últimos {precision.meses_evaluados} meses):
              error mensual {precision.wape ?? "—"} % · en el total {precision.error_total ?? "—"} %
            </span>
            <ChevronDown size={16} style={{ color: "#98a2b3", transform: verComparacion ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          <p className="mt-1 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>{precision.interpretacion}</p>
          <AnimatePresence initial={false}>
            {verComparacion && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <ComparacionModelos precision={precision} unidad={unidad} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <p className="mt-4 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
          Historial insuficiente para medir la precisión: se usa el promedio de los últimos 12 meses.
        </p>
      )}
    </motion.article>
  );
}

function ComparacionModelos({ precision, unidad }: { precision: NonNullable<PronosticoInsumo["precision"]>; unidad: string }) {
  const peor = Math.max(...precision.comparacion.map((c) => c.wape ?? 0), 1);
  return (
    <div className="mt-3 rounded-2xl p-3" style={{ backgroundColor: "#fafafa", border: "1px solid #f0f2f5" }}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
        Backtesting · gana el de menor error
      </p>
      <div className="flex flex-col gap-2">
        {precision.comparacion.map((c) => {
          const gana = c.modelo === precision.modelo_elegido;
          return (
            <div key={c.modelo}>
              <div className="flex items-center justify-between text-xs" style={{ fontFamily: FUENTE }}>
                <span style={{ color: gana ? VIOLETA : "#475467", fontWeight: gana ? 600 : 400 }}>
                  {gana && <Trophy size={11} className="mr-1 inline" />}{NOMBRE_MODELO[c.modelo]}
                  <span className="ml-1.5" style={{ color: "#98a2b3", fontWeight: 400 }}>· {c.descripcion}</span>
                </span>
                <span className="ml-3 shrink-0 whitespace-nowrap" style={{ color: "#344054" }}>
                  {c.wape ?? "—"} % <span style={{ color: "#98a2b3" }}>({numero.format(c.mae)} {unidad}/mes)</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full" style={{ backgroundColor: "#eef0f4" }}>
                <div className="h-1.5 rounded-full" style={{
                  width: `${Math.max(4, ((c.wape ?? 0) / peor) * 100)}%`,
                  backgroundColor: gana ? VIOLETA : "#d0d5dd",
                }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px]" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
        WAPE: error total ÷ consumo real. Se usa en lugar del MAPE porque no se dispara en los meses de poco consumo.
      </p>
    </div>
  );
}

function Dato({ etiqueta, valor, extra, alerta }: { etiqueta: string; valor: string; extra?: string; alerta?: boolean }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#f9fafb" }}>
      <p className="text-[11px] font-medium" style={{ color: "#98a2b3", fontFamily: FUENTE }}>{etiqueta}</p>
      <p className="mt-0.5 text-[14px] font-semibold leading-tight" style={{ color: alerta ? "#b42318" : "#101828", fontFamily: FUENTE }}>{valor}</p>
      {extra && <p className="mt-0.5 text-[11px]" style={{ color: "#98a2b3", fontFamily: FUENTE }}>{extra}</p>}
    </div>
  );
}

// ── Selector de insumos ──────────────────────────────────────────────────────

function SelectorInsumos({ insumos, cargando, elegidos, colorDe, alCambiar }: {
  insumos: { id: number; nombre: string; unidadMedida: string; stock: number }[];
  cargando: boolean;
  elegidos: number[];
  colorDe: (id: number) => string;
  alCambiar: (ids: number[]) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);
  const porId = useMemo(() => new Map(insumos.map((i) => [i.id, i])), [insumos]);
  const lleno = elegidos.length >= MAX_INSUMOS;
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
              placeholder={cargando ? "Cargando insumos…" : elegidos.length ? "Agregar otro…" : "Busca un insumo (tela, cremallera…)"}
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

// ── Escenario "¿y si?" ───────────────────────────────────────────────────────

function ConstructorEscenario({ colegios, uniformesDe, prendas, alCambiar }: {
  colegios: { id: number; nombre: string }[];
  uniformesDe: (colegioId: number) => Promise<UniformeResponse[]>;
  prendas: PrendaElegida[];
  alCambiar: (prendas: PrendaElegida[]) => void;
}) {
  const [colegioId, setColegioId] = useState<number | "">("");
  const [uniformes, setUniformes] = useState<UniformeResponse[]>([]);
  const [uniformeId, setUniformeId] = useState<number | "">("");
  const [talla, setTalla] = useState("");
  const [cantidad, setCantidad] = useState(50);
  const [cargandoUniformes, setCargandoUniformes] = useState(false);
  const uniforme = uniformes.find((u) => u.id === uniformeId);

  const elegirColegio = async (id: number | "") => {
    setColegioId(id);
    setUniformeId("");
    setTalla("");
    setUniformes([]);
    if (id === "") return;
    setCargandoUniformes(true);
    try {
      setUniformes(await uniformesDe(id));
    } finally {
      setCargandoUniformes(false);
    }
  };

  const agregar = () => {
    if (!uniforme || cantidad < 1) return;
    const colegio = colegios.find((c) => c.id === colegioId)?.nombre ?? "";
    alCambiar([...prendas, {
      uniformeId: uniforme.id,
      talla: talla || null,
      cantidad,
      etiqueta: `${cantidad} × ${uniforme.prenda} ${uniforme.tipo}${talla ? ` T.${talla}` : ""} · ${colegio}`,
    }]);
  };

  const selector = "rounded-xl border px-3 py-2 text-sm outline-none bg-white";
  const estilo = { borderColor: "#e5e7eb", fontFamily: FUENTE, color: "#344054" };

  return (
    <div className="mt-5 rounded-2xl p-4" style={{ backgroundColor: "#faf8ff", border: "1px dashed #ddd6fe" }}>
      <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#5b21b6", fontFamily: FUENTE }}>
        <FlaskConical size={15} /> ¿Y si entra este pedido? Las prendas se convierten en insumos con la receta de cada uniforme.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <select value={colegioId} onChange={(e) => elegirColegio(e.target.value ? Number(e.target.value) : "")}
          className={selector} style={{ ...estilo, minWidth: 200 }}>
          <option value="">Colegio…</option>
          {colegios.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select value={uniformeId} disabled={!uniformes.length}
          onChange={(e) => { setUniformeId(e.target.value ? Number(e.target.value) : ""); setTalla(""); }}
          className={selector} style={{ ...estilo, minWidth: 180 }}>
          <option value="">{cargandoUniformes ? "Cargando…" : "Prenda…"}</option>
          {uniformes.map((u) => <option key={u.id} value={u.id}>{u.prenda} · {u.tipo}{u.genero ? ` · ${u.genero}` : ""}</option>)}
        </select>
        <select value={talla} disabled={!uniforme || !uniforme.tallas.length} onChange={(e) => setTalla(e.target.value)}
          className={selector} style={estilo}>
          <option value="">Talla…</option>
          {uniforme?.tallas.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
          className={`${selector} w-24`} style={estilo} aria-label="Cantidad de prendas" />
        <button type="button" onClick={agregar} disabled={!uniforme}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all disabled:opacity-40"
          style={{ backgroundColor: "#ede9fe", color: "#5b21b6", fontFamily: FUENTE }}>
          <Plus size={15} /> Agregar
        </button>
      </div>
      {prendas.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prendas.map((p, i) => (
            <span key={`${p.uniformeId}-${p.talla}-${i}`} className="flex items-center gap-1.5 rounded-lg border bg-white py-1 pl-2.5 pr-1 text-xs"
              style={{ borderColor: "#e9e3ff", color: "#344054", fontFamily: FUENTE }}>
              {p.etiqueta}
              <button type="button" aria-label="Quitar prenda" onClick={() => alCambiar(prendas.filter((_, j) => j !== i))}
                className="rounded p-0.5 hover:bg-violet-50"><X size={12} /></button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
          Agrega una o más prendas. Si no agregas ninguna, se calcula sin escenario.
        </p>
      )}
    </div>
  );
}

// ── Piezas pequeñas ──────────────────────────────────────────────────────────

function Campo({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold" style={{ color: "#344054", fontFamily: FUENTE }}>{titulo}</p>
      {children}
      {ayuda && <p className="mt-1.5 text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>{ayuda}</p>}
    </div>
  );
}

function Pastilla({ activa, alTocar, children }: { activa: boolean; alTocar: () => void; children: React.ReactNode }) {
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

function Interruptor({ activo, alCambiar }: { activo: boolean; alCambiar: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => alCambiar(!activo)}
      className="relative h-6 w-11 rounded-full transition-colors" style={{ backgroundColor: activo ? VIOLETA : "#d0d5dd" }}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: activo ? 22 : 2 }} />
    </button>
  );
}

function EstadoInicial() {
  const pasos = [
    { icono: <PackageSearch size={18} />, titulo: "Elige qué predecir", texto: "Uno o varios insumos, el horizonte y cómo agrupar." },
    { icono: <FlaskConical size={18} />, titulo: "Simula un pedido", texto: "“¿Y si el colegio pide 200 camisas?”: mira cómo cambia el stock." },
    { icono: <Trophy size={18} />, titulo: "Confía en el modelo", texto: "Se prueban 3 modelos con datos reales y gana el que menos se equivoca." },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {pasos.map((p, i) => (
        <motion.div key={p.titulo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          style={{ ...tarjeta, padding: 18 }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#f5f3ff", color: VIOLETA }}>{p.icono}</span>
          <p className="mt-3 text-sm font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>{p.titulo}</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "#667085", fontFamily: FUENTE }}>{p.texto}</p>
        </motion.div>
      ))}
    </div>
  );
}

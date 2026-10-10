"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, CheckCheck, Printer, QrCode, Search, X } from "lucide-react";
import { insumoService } from "@/app/services/insumo.service";
import type { InsumoResponse } from "@/app/types/insumo";
import HojaEtiquetas, { Hoja, imprimirEtiquetas, repartirEnHojas } from "./HojaEtiquetas";
import { AZUL, Etiqueta, FUENTE, SelectorCopias, SelectorTamano } from "./controles";
import { porHoja, type TamanoEtiqueta } from "./etiquetaQr";

/** Hoja carta (216 mm) mostrada a esta escala en la vista previa. */
const ESCALA_PREVIA = 0.42;

/** Casilla de verificación con el estilo de la app. */
function Casilla({ marcada, parcial = false }: { marcada: boolean; parcial?: boolean }) {
  return (
    <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-md border transition"
      style={{ borderColor: marcada || parcial ? AZUL : "#d0d5dd", backgroundColor: marcada || parcial ? AZUL : "#fff" }}>
      {marcada ? <Check size={12} color="#fff" strokeWidth={3} /> : parcial ? <span className="h-0.5 w-2 rounded bg-white" /> : null}
    </span>
  );
}

/**
 * Impresión de etiquetas en lote: se eligen los insumos (por tipo o uno a uno),
 * el tamaño y las copias, y sale una hoja carta lista para recortar o para
 * hojas adhesivas. Los insumos inactivos no se ofrecen.
 */
export default function ImprimirEtiquetasModal({ onClose }: { onClose: () => void }) {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<string | null>(null);
  const [elegidos, setElegidos] = useState<Set<number>>(new Set());
  const [tamano, setTamano] = useState<TamanoEtiqueta>("mediana");
  const [copias, setCopias] = useState(1);

  useEffect(() => {
    let vigente = true;
    insumoService.listarTodos()
      .then((todos) => vigente && setInsumos(todos.filter((i) => i.activo !== false)))
      .catch(() => vigente && setError("No se pudieron cargar los insumos. Intenta de nuevo."))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; };
  }, []);

  const tipos = useMemo(() => {
    const conteo = new Map<string, number>();
    insumos.forEach((i) => conteo.set(i.tipo || "Otros", (conteo.get(i.tipo || "Otros") ?? 0) + 1));
    return [...conteo.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [insumos]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");
    return insumos.filter((i) => (!tipo || (i.tipo || "Otros") === tipo) && (!texto || i.nombre.toLocaleLowerCase("es").includes(texto)));
  }, [insumos, tipo, busqueda]);

  // En el orden de la lista (alfabético), no en el orden en que se marcaron.
  const seleccion = useMemo(() => insumos.filter((i) => elegidos.has(i.id)), [insumos, elegidos]);
  const totalEtiquetas = seleccion.length * copias;
  const hojas = repartirEnHojas(seleccion, copias, tamano);

  const visiblesMarcados = visibles.filter((i) => elegidos.has(i.id)).length;
  const todosVisibles = visibles.length > 0 && visiblesMarcados === visibles.length;

  const alternar = (id: number) => setElegidos((actual) => {
    const nuevo = new Set(actual);
    if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id);
    return nuevo;
  });
  // Todos los insumos activos, sin importar el filtro o la búsqueda.
  const todosElegidos = insumos.length > 0 && elegidos.size === insumos.length;
  const alternarTodos = () => setElegidos(todosElegidos ? new Set() : new Set(insumos.map((i) => i.id)));

  const alternarVisibles = () => setElegidos((actual) => {
    const nuevo = new Set(actual);
    visibles.forEach((i) => (todosVisibles ? nuevo.delete(i.id) : nuevo.add(i.id)));
    return nuevo;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15 }} role="dialog" aria-modal aria-labelledby="titulo-lote"
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5" style={{ borderColor: "#f0f0f4" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(11,61,145,0.08)" }}>
              <QrCode size={18} style={{ color: AZUL }} />
            </div>
            <div>
              <h3 id="titulo-lote" className="text-base font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>
                Imprimir etiquetas QR
              </h3>
              <p className="text-xs" style={{ color: "#9ca3af", fontFamily: FUENTE }}>
                Para pegar en rollos, cajas y estantes. Bodega las escanea desde la app móvil.
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ color: "#9ca3af" }}>
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_400px] lg:overflow-hidden">
          {/* Selección de insumos */}
          <div className="flex min-h-0 flex-col gap-3 p-6 lg:overflow-hidden">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar insumo..."
                  className="w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none"
                  style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: FUENTE }} />
              </div>
              <button onClick={alternarTodos} disabled={cargando || insumos.length === 0} aria-pressed={todosElegidos}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
                style={{ borderColor: AZUL, backgroundColor: todosElegidos ? "#fff" : AZUL, color: todosElegidos ? AZUL : "#fff", fontFamily: FUENTE }}>
                {todosElegidos
                  ? <><X size={15} /> Quitar todos</>
                  : <><CheckCheck size={15} /> Seleccionar todos ({insumos.length})</>}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[["Todos", insumos.length] as const, ...tipos].map(([nombre, n]) => {
                const activo = nombre === "Todos" ? tipo === null : tipo === nombre;
                return (
                  <button key={nombre} onClick={() => setTipo(nombre === "Todos" ? null : nombre)}
                    className="rounded-full border px-3 py-1 text-xs font-medium transition"
                    style={{ borderColor: activo ? AZUL : "#e5e7eb", backgroundColor: activo ? AZUL : "#fff",
                      color: activo ? "#fff" : "#475467", fontFamily: FUENTE }}>
                    {nombre} <span style={{ opacity: 0.7 }}>({n})</span>
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border" style={{ borderColor: "#eaecf0" }}>
              <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: "#f0f0f4" }}>
                <button onClick={alternarVisibles} disabled={visibles.length === 0} className="flex flex-1 items-center gap-3 text-left">
                  <Casilla marcada={todosVisibles} parcial={visiblesMarcados > 0 && !todosVisibles} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#667085", fontFamily: FUENTE }}>
                    {tipo ? `Todos los de tipo ${tipo}` : "Seleccionar todos"} ({visibles.length})
                  </span>
                </button>
                {elegidos.size > 0 && (
                  <button onClick={() => setElegidos(new Set())} className="text-xs font-medium" style={{ color: AZUL, fontFamily: FUENTE }}>
                    Quitar selección
                  </button>
                )}
              </div>

              <div className="max-h-[320px] overflow-y-auto lg:max-h-none lg:flex-1">
                {cargando ? (
                  <div className="flex flex-col gap-2 p-3">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl" style={{ backgroundColor: "#f3f4f6" }} />)}
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 p-4 text-sm" style={{ color: "#b42318", fontFamily: FUENTE }}>
                    <AlertCircle size={15} /> {error}
                  </div>
                ) : visibles.length === 0 ? (
                  <p className="p-6 text-center text-sm" style={{ color: "#9ca3af", fontFamily: FUENTE }}>
                    Ningún insumo coincide con la búsqueda.
                  </p>
                ) : visibles.map((i) => {
                  const marcado = elegidos.has(i.id);
                  return (
                    <button key={i.id} onClick={() => alternar(i.id)} aria-pressed={marcado}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition"
                      style={{ backgroundColor: marcado ? "rgba(11,61,145,0.04)" : "transparent" }}>
                      <Casilla marcada={marcado} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium" style={{ color: "#101828", fontFamily: FUENTE }}>{i.nombre}</span>
                        <span className="block text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
                          {i.tipo} · Código {i.id}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Opciones y vista previa */}
          <div className="flex min-h-0 flex-col gap-4 border-t p-6 lg:overflow-y-auto lg:border-l lg:border-t-0"
            style={{ borderColor: "#f0f0f4", backgroundColor: "#fafbfc" }}>
            <div>
              <Etiqueta>Tamaño</Etiqueta>
              <SelectorTamano valor={tamano} alCambiar={(t) => { setTamano(t); setCopias((c) => Math.min(c, porHoja(t))); }} />
            </div>
            <div>
              <Etiqueta>Copias de cada insumo</Etiqueta>
              <SelectorCopias valor={copias} maximo={porHoja(tamano)} alCambiar={setCopias} />
            </div>

            <div>
              <Etiqueta>Vista previa {hojas.length > 1 ? `(hoja 1 de ${hojas.length})` : ""}</Etiqueta>
              <div className="mx-auto overflow-hidden rounded-lg border"
                style={{ width: `calc(216mm * ${ESCALA_PREVIA})`, height: `calc(279mm * ${ESCALA_PREVIA})`,
                  borderColor: "#e5e7eb", backgroundColor: "#fff", boxShadow: "0 4px 16px rgba(15,23,42,0.08)" }}>
                {hojas.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-6 text-center text-xs" style={{ color: "#98a2b3", fontFamily: FUENTE }}>
                    Elige uno o más insumos para ver la hoja.
                  </div>
                ) : (
                  <div style={{ width: "216mm", padding: "10mm", transform: `scale(${ESCALA_PREVIA})`, transformOrigin: "top left" }}>
                    <Hoja etiquetas={hojas[0]} tamano={tamano} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#f0f0f4" }}>
          <p className="text-sm" style={{ color: "#475467", fontFamily: FUENTE }}>
            {seleccion.length === 0 ? "Ningún insumo seleccionado" : (
              <>
                <strong style={{ color: "#101828" }}>{totalEtiquetas}</strong> {totalEtiquetas === 1 ? "etiqueta" : "etiquetas"} ·{" "}
                {seleccion.length} {seleccion.length === 1 ? "insumo" : "insumos"} · {hojas.length} {hojas.length === 1 ? "hoja carta" : "hojas carta"}
              </>
            )}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-2xl border px-4 py-2.5 text-sm font-medium"
              style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: FUENTE }}>
              Cancelar
            </button>
            <button onClick={imprimirEtiquetas} disabled={seleccion.length === 0}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: AZUL, fontFamily: FUENTE }}>
              <Printer size={15} /> Imprimir
            </button>
          </div>
        </div>

        <HojaEtiquetas insumos={seleccion} copias={copias} tamano={tamano} />
      </motion.div>
    </div>
  );
}

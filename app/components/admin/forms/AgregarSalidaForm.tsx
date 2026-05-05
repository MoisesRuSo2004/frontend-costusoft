"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpFromLine, ArrowLeft, Plus, Trash2, Save, RotateCcw, CheckCircle2, Package, Search, AlertCircle, AlertTriangle, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { insumoService } from "@/app/services/insumo.service";
import { salidaService } from "@/app/services/salida.service";
import { useColegios } from "@/app/hooks/useColegios";
import type { InsumoOption } from "@/app/types/insumo";

interface Linea {
  insumoId: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  cantidad: number;
}

const lbl: React.CSSProperties = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" };
function inp(err?: boolean): React.CSSProperties {
  return { width: "100%", padding: "11px 14px", border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 10, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: "#111827", outline: "none", backgroundColor: "#fff", boxSizing: "border-box", transition: "border-color 0.2s" };
}

export default function AgregarSalidaForm({ returnPath = "/salidas" }: { returnPath?: string }) {
  const router = useRouter();
  const { colegios } = useColegios();
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [colegioId, setColegioId] = useState<number | "">();
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<InsumoOption[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [cantidadInput, setCantidadInput] = useState("1");
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<InsumoOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [agregarError, setAgregarError] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscarInsumos = useCallback(async (query: string) => {
    setBusqueda(query);
    setInsumoSeleccionado(null);
    if (query.trim().length < 2) { setSugerencias([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await insumoService.buscar(query.trim());
        setSugerencias(res as InsumoOption[]);
      } catch { setSugerencias([]); }
      finally { setBuscando(false); }
    }, 350);
  }, []);

  const seleccionarInsumo = (insumo: InsumoOption) => {
    setInsumoSeleccionado(insumo);
    setBusqueda(insumo.nombre);
    setSugerencias([]);
    setAgregarError("");
    const yaEnLista = lineas.find(l => l.insumoId === insumo.id);
    const disponible = insumo.stock - (yaEnLista?.cantidad ?? 0);
    setCantidadInput(disponible > 0 ? "1" : "0");
  };

  const agregarLinea = () => {
    if (!insumoSeleccionado) { setAgregarError("Selecciona un insumo de la lista antes de agregar."); return; }
    const cant = Number(cantidadInput);
    if (!cant || cant <= 0) { setAgregarError("La cantidad debe ser mayor a 0."); return; }
    if (cant > insumoSeleccionado.stock) {
      setAgregarError(`Stock insuficiente. Solo hay ${insumoSeleccionado.stock} ${insumoSeleccionado.unidadMedida} disponibles de "${insumoSeleccionado.nombre}".`);
      return;
    }
    if (lineas.some(l => l.insumoId === insumoSeleccionado.id)) { setAgregarError("Este insumo ya fue agregado. Elimínalo de la lista y vuelve a agregarlo."); return; }
    setLineas(ls => [...ls, { insumoId: insumoSeleccionado.id, nombre: insumoSeleccionado.nombre, unidadMedida: insumoSeleccionado.unidadMedida, stockActual: insumoSeleccionado.stock, cantidad: cant }]);
    setBusqueda(""); setInsumoSeleccionado(null); setSugerencias([]); setCantidadInput("1"); setAgregarError("");
  };

  const quitarLinea = (id: number) => setLineas(ls => ls.filter(l => l.insumoId !== id));

  const limpiar = () => {
    setFecha(""); setDescripcion(""); setColegioId(""); setLineas([]); setBusqueda(""); setInsumoSeleccionado(null); setSugerencias([]); setCantidadInput("1");
    setValidationError(""); setApiError(""); setAgregarError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fecha) { setValidationError("La fecha es obligatoria."); return; }
    if (!descripcion.trim()) { setValidationError("La descripción es obligatoria."); return; }
    if (lineas.length === 0) { setValidationError("Agrega al menos un insumo."); return; }
    setLoading(true);
    setApiError(""); setValidationError("");
    try {
      await salidaService.crear({
        fecha,
        descripcion: descripcion.trim(),
        colegioId: colegioId ? Number(colegioId) : undefined,
        detalles: lineas.map(l => ({ insumoId: l.insumoId, cantidad: l.cantidad })),
      });
      setSuccess(true);
      setTimeout(() => router.push(returnPath), 1800);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error al registrar la salida.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={returnPath} className="inline-flex items-center gap-1.5 text-sm font-medium transition"
          style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#b45309")} onMouseLeave={e => (e.currentTarget.style.color = "#667085")}>
          <ArrowLeft size={15} /> Salidas
        </Link>
        <span style={{ color: "#d0d5dd" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>Nueva Salida</span>
      </div>

      {/* Header */}
      <div className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#fde68a", background: "linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(11,61,145,0.07) 100%)" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(245,158,11,0.12)" }}>
            <ArrowUpFromLine size={22} style={{ color: "#b45309" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>Registrar solicitud de salida</h1>
            <p className="mt-0.5 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              La solicitud quedará PENDIENTE. Bodega validará el stock y confirmará el despacho.
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}>
            <CheckCircle2 size={18} style={{ color: "#16a34a" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#15803d", fontFamily: "'Poppins', sans-serif" }}>¡Solicitud de salida registrada!</p>
              <p className="text-xs" style={{ color: "#86efac", fontFamily: "'Poppins', sans-serif" }}>Redirigiendo…</p>
            </div>
          </motion.div>
        )}
        {(apiError || validationError) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <AlertCircle size={18} style={{ color: "#dc2626" }} />
            <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{apiError || validationError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Información general */}
        <div className="rounded-3xl border p-6" style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>Información general</h2>
          
          {/* Fecha */}
          <div className="mb-4">
            <label style={lbl}>Fecha de salida <span style={{ color: "#ef4444" }}>*</span></label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#b45309" }} />
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ ...inp(!fecha && !!validationError), paddingLeft: 40 }}
                onFocus={e => { e.currentTarget.style.borderColor = "#b45309"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(180,83,9,0.10)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
            </div>
          </div>

          {/* Colegio */}
          <div className="mb-4">
            <label style={lbl}>Colegio destino (opcional)</label>
            <select value={colegioId ?? ""} onChange={e => setColegioId(e.target.value ? Number(e.target.value) : "")} style={{ ...inp(), cursor: "pointer" }}>
              <option value="">-- Sin colegio específico --</option>
              {colegios.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label style={lbl}>Descripción <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej. Despacho de materiales para producción lote #15..."
              style={inp(!descripcion && !!validationError)}
              onFocus={e => { e.currentTarget.style.borderColor = "#b45309"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(180,83,9,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
          </div>
        </div>

        {/* Insumos */}
        <div className="rounded-3xl border p-6" style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>Insumos a despachar</h2>

          <div className="mb-1 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
            <div className="relative">
              <label style={lbl}>Buscar insumo</label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input value={busqueda} onChange={e => buscarInsumos(e.target.value)} placeholder="Escribe el nombre..."
                  style={{ ...inp(), paddingLeft: 40 }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#b45309"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(180,83,9,0.10)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
              </div>
              <AnimatePresence>
                {sugerencias.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border"
                    style={{ borderColor: "#e5e7eb", backgroundColor: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                    {buscando ? (
                      <p className="px-4 py-3 text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>Buscando...</p>
                    ) : (
                      sugerencias.map(s => (
                        <button key={s.id} type="button" onClick={() => seleccionarInsumo(s)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fffbeb")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                          <Package size={14} style={{ color: "#b45309", flexShrink: 0 }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: "#101828" }}>{s.nombre}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs" style={{ color: s.stock > 0 ? "#9ca3af" : "#dc2626" }}>
                                Stock: {s.stock} {s.unidadMedida}
                              </span>
                              {s.stock <= 0 && <AlertTriangle size={11} style={{ color: "#dc2626" }} />}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label style={lbl}>Cantidad</label>
              <input type="number" min={1} max={insumoSeleccionado?.stock ?? 9999} value={cantidadInput}
                onChange={e => { setCantidadInput(e.target.value); setAgregarError(""); }} style={inp()}
                onFocus={e => { e.currentTarget.style.borderColor = "#b45309"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(180,83,9,0.10)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
              {insumoSeleccionado && (
                <p className="mt-1 text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                  Máx: {insumoSeleccionado.stock} {insumoSeleccionado.unidadMedida}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <button type="button" onClick={agregarLinea}
                className="inline-flex h-[42px] items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition"
                style={{ backgroundColor: "#b45309", fontFamily: "'Poppins', sans-serif", marginTop: insumoSeleccionado ? 16 : 22 }}>
                <Plus size={15} /> Agregar
              </button>
            </div>
          </div>

          {/* Error inline del botón Agregar */}
          <AnimatePresence>
            {agregarError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-3 flex items-center gap-2.5 rounded-2xl border px-4 py-3"
                style={{ borderColor: "#fca5a5", backgroundColor: "#fef2f2" }}>
                <AlertTriangle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
                <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{agregarError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista */}
          {lineas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-8 gap-2" style={{ borderColor: "#e5e7eb" }}>
              <Package size={28} style={{ color: "#d1d5db" }} />
              <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>Agrega los insumos a despachar</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-hidden rounded-2xl border" style={{ borderColor: "#eaecf0" }}>
              <table className="w-full min-w-[480px]">
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    {["Insumo", "Stock actual", "A despachar", "Estado", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineas.map(l => {
                    const pct = l.stockActual > 0 ? Math.round((l.cantidad / l.stockActual) * 100) : 0;
                    const suficiente = l.cantidad <= l.stockActual;
                    return (
                      <tr key={l.insumoId} style={{ borderTop: "1px solid #f0f0f4" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(180,83,9,0.08)" }}>
                              <Package size={12} style={{ color: "#b45309" }} />
                            </div>
                            <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>{l.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                          {l.stockActual} {l.unidadMedida}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: suficiente ? "#b45309" : "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                          -{l.cantidad}
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-24">
                            <div className="mb-1 flex justify-between text-[10px]" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                              <span>{pct}% del stock</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#f3f4f6" }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 80 ? "#dc2626" : pct > 50 ? "#f59e0b" : "#49c21b" }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => quitarLinea(l.insumoId)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition"
                            style={{ color: "#9ca3af" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")} onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end border-t px-4 py-3" style={{ borderColor: "#f0f0f4", backgroundColor: "#f9fafb" }}>
                <span className="text-xs font-semibold" style={{ color: "#b45309", fontFamily: "'Poppins', sans-serif" }}>
                  {lineas.length} ítem{lineas.length !== 1 ? "s" : ""} a despachar
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={limpiar} className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            <RotateCcw size={14} /> Limpiar
          </button>
          <button type="submit" disabled={loading || success || lineas.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#b45309", fontFamily: "'Poppins', sans-serif", cursor: loading || lineas.length === 0 ? "not-allowed" : "pointer", opacity: (success || lineas.length === 0) ? 0.6 : 1 }}>
            <Save size={14} /> {loading ? "Registrando..." : "Registrar salida"}
          </button>
        </div>
      </form>
    </section>
  );
}

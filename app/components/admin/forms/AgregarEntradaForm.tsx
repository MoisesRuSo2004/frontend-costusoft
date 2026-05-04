"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, ArrowLeft, Plus, Trash2, Save, RotateCcw, CheckCircle2, Package, Search, AlertCircle, Calendar, PackagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { insumoService } from "@/app/services/insumo.service";
import { entradaService } from "@/app/services/entrada.service";
import { useProveedores } from "@/app/hooks/useProveedores";
import type { InsumoOption } from "@/app/types/insumo";

interface Linea {
  insumoId: number;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
}

const lbl: React.CSSProperties = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" };
function inp(err?: boolean): React.CSSProperties {
  return { width: "100%", padding: "11px 14px", border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 10, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: "#111827", outline: "none", backgroundColor: "#fff", boxSizing: "border-box", transition: "border-color 0.2s" };
}

export default function AgregarEntradaForm({ returnPath = "/entradas" }: { returnPath?: string }) {
  const router = useRouter();
  const { proveedores, loading: loadingProveedores, error: errorProveedores, recargar: recargarProveedores } = useProveedores();
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [proveedorId, setProveedorId] = useState<number | "">();
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<InsumoOption[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [sinResultados, setSinResultados] = useState(false);
  const [cantidadInput, setCantidadInput] = useState("1");
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<InsumoOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationError, setValidationError] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Busca insumos con debounce
  const buscarInsumos = useCallback(async (query: string) => {
    setBusqueda(query);
    setInsumoSeleccionado(null);
    setSinResultados(false);
    if (query.trim().length < 2) { setSugerencias([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await insumoService.buscar(query.trim());
        setSugerencias(res as InsumoOption[]);
        setSinResultados(res.length === 0);
      } catch { setSugerencias([]); setSinResultados(false); }
      finally { setBuscando(false); }
    }, 350);
  }, []);

  const seleccionarInsumo = (insumo: InsumoOption) => {
    setInsumoSeleccionado(insumo);
    setBusqueda(insumo.nombre);
    setSugerencias([]);
    setSinResultados(false);
  };

  const agregarLinea = () => {
    if (!insumoSeleccionado) { setValidationError("Selecciona un insumo de la lista."); return; }
    const cant = Number(cantidadInput);
    if (!cant || cant <= 0) { setValidationError("La cantidad debe ser mayor a 0."); return; }
    if (lineas.some(l => l.insumoId === insumoSeleccionado.id)) { setValidationError("Este insumo ya fue agregado."); return; }
    setLineas(ls => [...ls, { insumoId: insumoSeleccionado.id, nombre: insumoSeleccionado.nombre, unidadMedida: insumoSeleccionado.unidadMedida, cantidad: cant }]);
    setBusqueda(""); setInsumoSeleccionado(null); setSugerencias([]); setSinResultados(false); setCantidadInput("1"); setValidationError("");
  };

  const quitarLinea = (id: number) => setLineas(ls => ls.filter(l => l.insumoId !== id));

  const limpiar = () => {
    setFecha(""); setDescripcion(""); setProveedorId(""); setLineas([]); setBusqueda(""); setInsumoSeleccionado(null); setSugerencias([]); setCantidadInput("1");
    setValidationError(""); setApiError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fecha) { setValidationError("La fecha es obligatoria."); return; }
    if (!proveedorId) { setValidationError("El proveedor es obligatorio."); return; }
    if (!descripcion.trim()) { setValidationError("La descripción es obligatoria."); return; }
    if (lineas.length === 0) { setValidationError("Agrega al menos un insumo."); return; }
    setLoading(true);
    setApiError("");
    setValidationError("");
    try {
      await entradaService.crear({
        fecha,
        descripcion: descripcion.trim(),
        proveedorId: Number(proveedorId),
        detalles: lineas.map(l => ({ insumoId: l.insumoId, cantidad: l.cantidad })),
      });
      setSuccess(true);
      setTimeout(() => router.push(returnPath), 1800);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error al registrar la entrada.");
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
          onMouseEnter={e => (e.currentTarget.style.color = "#0b3d91")} onMouseLeave={e => (e.currentTarget.style.color = "#667085")}>
          <ArrowLeft size={15} /> Entradas
        </Link>
        <span style={{ color: "#d0d5dd" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>Nueva Entrada</span>
      </div>

      {/* Header */}
      <div className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#dbe4ff", background: "linear-gradient(135deg, rgba(11,61,145,0.07) 0%, rgba(73,194,27,0.07) 100%)" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(11,61,145,0.10)" }}>
            <ArrowDownToLine size={22} style={{ color: "#0b3d91" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>Registrar solicitud de entrada</h1>
            <p className="mt-0.5 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              La solicitud quedará PENDIENTE hasta que Bodega la confirme y aplique el stock.
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
              <p className="text-sm font-semibold" style={{ color: "#15803d", fontFamily: "'Poppins', sans-serif" }}>¡Solicitud de entrada registrada!</p>
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
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            Información general
          </h2>
          
          {/* Fecha */}
          <div className="mb-4">
            <label style={lbl}>Fecha de entrada <span style={{ color: "#ef4444" }}>*</span></label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#0b3d91" }} />
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ ...inp(!fecha && !!validationError), paddingLeft: 40 }}
                onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
            </div>
          </div>

          {/* Proveedor */}
          <div className="mb-4">
            <label style={lbl}>Proveedor <span style={{ color: "#ef4444" }}>*</span></label>
            {loadingProveedores ? (
              <div style={{ ...inp(), color: "#9ca3af", display: "flex", alignItems: "center", gap: 8 }}>
                <span>Cargando proveedores...</span>
              </div>
            ) : errorProveedores ? (
              <div className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
                <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
                <p className="text-sm flex-1" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>
                  No se pudieron cargar los proveedores.
                </p>
                <button type="button" onClick={() => recargarProveedores(0)}
                  className="text-xs font-semibold underline"
                  style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>
                  Reintentar
                </button>
              </div>
            ) : (
              <select value={proveedorId ?? ""} onChange={e => setProveedorId(e.target.value ? Number(e.target.value) : "")} style={{ ...inp(!proveedorId && !!validationError), cursor: "pointer" }}>
                <option value="">Selecciona un proveedor...</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — {p.nit}</option>
                ))}
              </select>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label style={lbl}>Descripción <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej. Compra mensual de materiales..."
              style={inp(!descripcion && !!validationError)}
              onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
          </div>
        </div>

        {/* Agregar insumos */}
        <div className="rounded-3xl border p-6" style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            Insumos a ingresar
          </h2>

          {/* Buscador de insumos */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
            <div className="relative" ref={dropdownRef}>
              <label style={lbl}>Buscar insumo</label>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input value={busqueda} onChange={e => buscarInsumos(e.target.value)} placeholder="Escribe el nombre..."
                  style={{ ...inp(), paddingLeft: 40 }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
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
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f7ff")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                          <Package size={14} style={{ color: "#0b3d91", flexShrink: 0 }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#101828" }}>{s.nombre}</p>
                            <p className="text-xs" style={{ color: "#9ca3af" }}>Stock: {s.stock} {s.unidadMedida}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
                {sinResultados && !buscando && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-2 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                    style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb" }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PackagePlus size={15} style={{ color: "#d97706", flexShrink: 0 }} />
                      <p className="text-sm truncate" style={{ color: "#92400e", fontFamily: "'Poppins', sans-serif" }}>
                        <span className="font-semibold">"{busqueda}"</span> no existe en inventario.
                      </p>
                    </div>
                    <Link href="/inventario" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition"
                      style={{ backgroundColor: "#d97706", color: "#fff", fontFamily: "'Poppins', sans-serif" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b45309")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#d97706")}>
                      <PackagePlus size={12} /> Crear en inventario
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label style={lbl}>Cantidad</label>
              <input type="number" min={1} value={cantidadInput} onChange={e => setCantidadInput(e.target.value)} style={inp()}
                onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
            </div>

            <div className="flex items-end">
              <button type="button" onClick={agregarLinea}
                className="inline-flex h-[42px] items-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition"
                style={{ backgroundColor: "#0b3d91", fontFamily: "'Poppins', sans-serif", marginTop: 22 }}>
                <Plus size={15} /> Agregar
              </button>
            </div>
          </div>

          {/* Lista de ítems */}
          {lineas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-8 gap-2" style={{ borderColor: "#e5e7eb" }}>
              <Package size={28} style={{ color: "#d1d5db" }} />
              <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>Agrega los insumos que van a ingresar</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-hidden rounded-2xl border" style={{ borderColor: "#eaecf0" }}>
              <table className="w-full min-w-[480px]">
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    {["Insumo", "Unidad", "Cantidad", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineas.map(l => (
                    <tr key={l.insumoId} style={{ borderTop: "1px solid #f0f0f4" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(11,61,145,0.08)" }}>
                            <Package size={12} style={{ color: "#0b3d91" }} />
                          </div>
                          <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>{l.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>{l.unidadMedida}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: "#49c21b", fontFamily: "'Poppins', sans-serif" }}>+{l.cantidad}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => quitarLinea(l.insumoId)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition"
                          style={{ color: "#9ca3af" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")} onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end border-t px-4 py-3" style={{ borderColor: "#f0f0f4", backgroundColor: "#f9fafb" }}>
                <span className="text-xs font-semibold" style={{ color: "#49c21b", fontFamily: "'Poppins', sans-serif" }}>
                  {lineas.length} ítem{lineas.length !== 1 ? "s" : ""} · {lineas.reduce((a, l) => a + l.cantidad, 0)} uds. totales
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={limpiar} className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            <RotateCcw size={14} /> Limpiar
          </button>
          <button type="submit" disabled={loading || success || lineas.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold text-white transition"
            style={{ backgroundColor: loading ? "#3aad17" : "#49c21b", fontFamily: "'Poppins', sans-serif", cursor: loading || lineas.length === 0 ? "not-allowed" : "pointer", opacity: (success || lineas.length === 0) ? 0.6 : 1 }}>
            <Save size={14} /> {loading ? "Registrando..." : "Registrar entrada"}
          </button>
        </div>
      </form>
    </section>
  );
}

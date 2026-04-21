"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  PlusCircle,
  Shirt,
  Trash2,
} from "lucide-react";
import { institucionService } from "@/app/services/institucion.service";
import type { CatalogoItem, InstitucionPedidoDetalleRequest } from "@/app/types/institucion";

// ─── Carrito item ─────────────────────────────────────────────────────────────

interface CartItem extends InstitucionPedidoDetalleRequest {
  key: string;
  nombreUniforme: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'Poppins', sans-serif",
  color: "#101828",
  backgroundColor: "#ffffff",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const FOCUS = { borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" };
const BLUR = { borderColor: "#e5e7eb", boxShadow: "none" };

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NuevoPedidoPage() {
  const router = useRouter();

  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState("");

  // Formulario de agregar prenda
  const [uniformeSelId, setUniformeSelId] = useState<number | "">("");
  const [tallasSel, setTallasSel] = useState<string[]>([]);
  const [tallaSel, setTallaSel] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // Carrito
  const [carrito, setCarrito] = useState<CartItem[]>([]);

  // Meta del pedido
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Envío
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await institucionService.getCatalogo();
        setCatalogo(data);
      } catch (err) {
        setErrorCatalogo(err instanceof Error ? err.message : "Error al cargar el catálogo.");
      } finally {
        setLoadingCatalogo(false);
      }
    })();
  }, []);

  // Cuando cambia el uniforme seleccionado, actualizar tallas
  useEffect(() => {
    if (uniformeSelId === "") {
      setTallasSel([]);
      setTallaSel("");
      return;
    }
    const item = catalogo.find((c) => c.uniformeId === uniformeSelId);
    setTallasSel(item?.tallas ?? []);
    setTallaSel(item?.tallas?.[0] ?? "");
  }, [uniformeSelId, catalogo]);

  const agregarAlCarrito = () => {
    if (uniformeSelId === "" || !tallaSel || cantidad < 1) return;
    const item = catalogo.find((c) => c.uniformeId === uniformeSelId);
    if (!item) return;
    const key = `${uniformeSelId}-${tallaSel}`;
    setCarrito((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) =>
          c.key === key ? { ...c, cantidad: c.cantidad + cantidad } : c
        );
      }
      return [
        ...prev,
        {
          key,
          uniformeId: uniformeSelId as number,
          talla: tallaSel,
          cantidad,
          nombreUniforme: item.nombre,
        },
      ];
    });
    // Reset campos
    setUniformeSelId("");
    setCantidad(1);
  };

  const removeFromCarrito = (key: string) => {
    setCarrito((prev) => prev.filter((c) => c.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carrito.length === 0) {
      setError("Agrega al menos una prenda al pedido.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const detalles: InstitucionPedidoDetalleRequest[] = carrito.map(({ uniformeId, cantidad, talla }) => ({
        uniformeId,
        cantidad,
        talla,
      }));
      const pedido = await institucionService.crearPedido({
        fechaEstimadaEntrega: fechaEntrega || undefined,
        observaciones: observaciones || undefined,
        detalles,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/institucion/pedidos/${pedido.id}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el pedido.");
    } finally {
      setLoading(false);
    }
  };

  // ── Estado de éxito ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0" }}
        >
          <CheckCircle2 size={40} style={{ color: "#16a34a" }} />
        </motion.div>
        <h2 className="text-2xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
          ¡Pedido creado!
        </h2>
        <p className="text-sm" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
          Tu pedido fue registrado exitosamente. Redirigiendo...
        </p>
      </div>
    );
  }

  // ── Catálogo vacío ───────────────────────────────────────────────────────
  if (!loadingCatalogo && catalogo.length === 0) {
    return (
      <section className="flex flex-col gap-6 pb-10">
        <Link
          href="/institucion/pedidos"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
        >
          <ArrowLeft size={15} /> Volver a pedidos
        </Link>
        <div
          className="flex flex-col items-center gap-4 rounded-3xl border p-12 text-center"
          style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff" }}
        >
          <Package size={40} style={{ color: "#d1d5db" }} />
          <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
            Catálogo no disponible
          </h2>
          <p className="max-w-sm text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
            Tu colegio aún no tiene prendas configuradas. Contacta al administrador de Costusoft para configurar el catálogo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 pb-10 max-w-3xl">

      {/* Volver */}
      <Link
        href="/institucion/pedidos"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
      >
        <ArrowLeft size={15} /> Volver a pedidos
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
          Nuevo pedido
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
          Selecciona prendas del catálogo y configura tu pedido.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Selector de prenda ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border p-6"
          style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
        >
          <h2
            className="mb-4 flex items-center gap-2 text-base font-semibold"
            style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
          >
            <Shirt size={16} style={{ color: "#6366f1" }} />
            Agregar prenda al pedido
          </h2>

          {loadingCatalogo ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" style={{ color: "#6366f1" }} />
              <span className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Cargando catálogo...
              </span>
            </div>
          ) : errorCatalogo ? (
            <div
              className="flex items-center gap-2 rounded-xl border px-4 py-3"
              style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
            >
              <AlertCircle size={14} style={{ color: "#dc2626" }} />
              <span className="text-sm" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{errorCatalogo}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Prenda */}
              <div>
                <label className="block mb-1.5 text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                  Prenda <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={uniformeSelId}
                  onChange={(e) => setUniformeSelId(e.target.value === "" ? "" : Number(e.target.value))}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, FOCUS)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, BLUR)}
                >
                  <option value="">— Selecciona una prenda —</option>
                  {catalogo.map((item) => (
                    <option key={item.uniformeId} value={item.uniformeId}>
                      {item.nombre} ({item.tipo} · {item.genero ?? "Unisex"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Talla */}
                <div>
                  <label className="block mb-1.5 text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                    Talla <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={tallaSel}
                    onChange={(e) => setTallaSel(e.target.value)}
                    disabled={tallasSel.length === 0}
                    style={{ ...inputStyle, opacity: tallasSel.length === 0 ? 0.5 : 1 }}
                    onFocus={(e) => Object.assign(e.currentTarget.style, FOCUS)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, BLUR)}
                  >
                    {tallasSel.length === 0 ? (
                      <option value="">— Primero selecciona prenda —</option>
                    ) : (
                      tallasSel.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block mb-1.5 text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                    Cantidad <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.currentTarget.style, FOCUS)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, BLUR)}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={agregarAlCarrito}
                disabled={uniformeSelId === "" || !tallaSel || cantidad < 1}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: uniformeSelId === "" ? "#e5e7eb" : "#6366f1",
                  color: uniformeSelId === "" ? "#9ca3af" : "#ffffff",
                  cursor: uniformeSelId === "" ? "not-allowed" : "pointer",
                  fontFamily: "'Poppins', sans-serif",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (uniformeSelId !== "") (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                  if (uniformeSelId !== "") (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
                }}
              >
                <PlusCircle size={15} />
                Agregar al pedido
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Carrito ───────────────────────────────────────────── */}
        <AnimatePresence>
          {carrito.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border p-6"
              style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
            >
              <h2
                className="mb-4 flex items-center gap-2 text-base font-semibold"
                style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
              >
                <Package size={16} style={{ color: "#6366f1" }} />
                Prendas seleccionadas ({carrito.length})
              </h2>

              <div className="flex flex-col gap-2">
                {carrito.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3"
                    style={{ borderColor: "#eef2ff", backgroundColor: "#fafafa" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Shirt size={15} style={{ color: "#6366f1", flexShrink: 0 }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                          {item.nombreUniforme}
                        </p>
                        <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                          Talla {item.talla} · {item.cantidad} unidades
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCarrito(item.key)}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fee2e2")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fef2f2")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Datos adicionales ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border p-6"
          style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
        >
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
          >
            Datos del pedido
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                Fecha estimada de entrega <span style={{ color: "#9ca3af" }}>(opcional)</span>
              </label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, FOCUS)}
                onBlur={(e) => Object.assign(e.currentTarget.style, BLUR)}
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                Observaciones <span style={{ color: "#9ca3af" }}>(opcional, máx. 500 caracteres)</span>
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Ej: Para inicio de año escolar 2026. Prioridad alta."
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={(e) => Object.assign(e.currentTarget.style, FOCUS)}
                onBlur={(e) => Object.assign(e.currentTarget.style, BLUR)}
              />
              <p className="mt-1 text-right text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {observaciones.length}/500
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Error ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-2xl border px-4 py-3"
              style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
            >
              <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Botón enviar ──────────────────────────────────────── */}
        <div className="flex gap-3">
          <Link
            href="/institucion/pedidos"
            className="flex-1 flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
            style={{
              borderColor: "#e5e7eb",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontFamily: "'Poppins', sans-serif",
              textDecoration: "none",
            }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || carrito.length === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors"
            style={{
              backgroundColor: loading || carrito.length === 0 ? "#a5b4fc" : "#6366f1",
              cursor: loading || carrito.length === 0 ? "not-allowed" : "pointer",
              border: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!loading && carrito.length > 0)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              if (!loading && carrito.length > 0)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1";
            }}
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Enviando pedido...</>
            ) : (
              <><CheckCircle2 size={15} /> Confirmar pedido ({carrito.length} prenda{carrito.length !== 1 ? "s" : ""})</>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

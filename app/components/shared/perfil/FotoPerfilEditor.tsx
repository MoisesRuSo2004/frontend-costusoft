"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, X, Check, Trash2, RefreshCw,
  ImageIcon, AlertCircle, Crop, ZoomIn, ZoomOut,
  RotateCcw, Eye,
} from "lucide-react";
import UserAvatar from "@/app/components/shared/ui/UserAvatar";
import { usuarioService } from "@/app/services/usuario.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  username: string;
  fotoUrl?: string | null;
  accentColor: string;
  size?: number;
  onFotoUpdated: (url: string | null) => void;
}

type Vista = "inicio" | "visor" | "fuente" | "recorte";
type Fuente = "upload" | "camera";

// ─── Constantes ───────────────────────────────────────────────────────────────

const MAX_SIZE_MB   = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── Helpers canvas ───────────────────────────────────────────────────────────

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise(res => canvas.toBlob(b => res(b!), "image/jpeg", 0.92));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function validarArchivo(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))        return "Solo JPG, PNG, WEBP o GIF.";
  if (file.size > MAX_SIZE_MB * 1024 * 1024)     return `Máximo ${MAX_SIZE_MB} MB.`;
  return null;
}

function blobToFile(blob: Blob, name = "foto.jpg"): File {
  return new File([blob], name, { type: "image/jpeg" });
}

// ─── Overlay interactivo del avatar ──────────────────────────────────────────

function AvatarOverlay({ username, fotoUrl, accentColor, size, onClick }: {
  username: string; fotoUrl?: string | null; accentColor: string; size: number; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative cursor-pointer" style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={onClick} role="button" aria-label="Editar foto de perfil">
      <UserAvatar name={username} size={size} accentColor={accentColor}
        src={fotoUrl ?? undefined} borderWidth={4} borderColor="#ffffff"
        shadow="0 4px 24px rgba(0,0,0,0.18)" />
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.50)", backdropFilter: "blur(1px)" }}>
            <Camera size={size * 0.26} color="#fff" strokeWidth={1.8} />
            <span style={{ color: "#fff", fontSize: size * 0.115, fontWeight: 600, marginTop: 3, fontFamily: "var(--font-poppins),sans-serif" }}>
              {fotoUrl ? "Editar" : "Agregar"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white"
        style={{ width: size * 0.32, height: size * 0.32, backgroundColor: accentColor }}>
        <Camera size={size * 0.14} color="#fff" strokeWidth={2} />
      </div>
    </div>
  );
}

// ─── Zona de carga de archivo ─────────────────────────────────────────────────

function ZonaArchivo({ onFile, accentColor }: { onFile: (f: File) => void; accentColor: string }) {
  const [isDrag, setIsDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (file: File) => {
    const err = validarArchivo(file);
    if (err) { alert(err); return; }
    onFile(file);
  };

  return (
    <div onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={e => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all"
      style={{ borderColor: isDrag ? accentColor : "#d0d5dd", backgroundColor: isDrag ? `${accentColor}08` : "#f8fafc" }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accentColor}15` }}>
        <ImageIcon size={26} style={{ color: accentColor }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins),sans-serif" }}>
          Arrastra tu foto aquí o <span style={{ color: accentColor }}>busca archivo</span>
        </p>
        <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins),sans-serif" }}>
          JPG, PNG, WEBP — máx. {MAX_SIZE_MB} MB
        </p>
      </div>
      <input ref={inputRef} type="file" accept={ALLOWED_TYPES.join(",")} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
    </div>
  );
}

// ─── Cámara ───────────────────────────────────────────────────────────────────

function CamaraCaptura({ onCapture, accentColor }: { onCapture: (f: File) => void; accentColor: string }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 640 } })
      .then(s => {
        streamRef.current = s;
        setLoading(false);
        if (videoRef.current) { videoRef.current.srcObject = s; void videoRef.current.play(); }
      })
      .catch(() => { setError("No se pudo acceder a la cámara. Verifica los permisos."); setLoading(false); });
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const capturar = useCallback(() => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size);
    canvas.toBlob(blob => { if (blob) onCapture(blobToFile(blob, "captura.jpg")); }, "image/jpeg", 0.92);
  }, [onCapture]);

  if (loading) return (
    <div className="flex h-56 items-center justify-center gap-2">
      <RefreshCw size={18} className="animate-spin" style={{ color: accentColor }} />
      <span className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins),sans-serif" }}>Activando cámara...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
      <AlertCircle size={28} style={{ color: "#dc2626" }} />
      <p className="text-center text-sm" style={{ color: "#b42318", fontFamily: "var(--font-poppins),sans-serif" }}>{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative overflow-hidden rounded-2xl" style={{ width: 272, height: 272 }}>
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full border-2 border-white border-dashed opacity-60" style={{ width: 210, height: 210 }} />
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <button type="button" onClick={capturar}
        className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition active:scale-95"
        style={{ backgroundColor: accentColor, fontFamily: "var(--font-poppins),sans-serif" }}>
        <Camera size={16} />Tomar foto
      </button>
    </div>
  );
}

// ─── Editor de recorte ────────────────────────────────────────────────────────

function EditorRecorte({ imageSrc, accentColor, uploading, onConfirm, onCancel }: {
  imageSrc: string; accentColor: string; uploading: boolean;
  onConfirm: (area: Area) => void; onCancel: () => void;
}) {
  const [crop,   setCrop]   = useState<Point>({ x: 0, y: 0 });
  const [zoom,   setZoom]   = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm font-medium" style={{ color: "#344054", fontFamily: "var(--font-poppins),sans-serif" }}>
        Ajusta el encuadre de tu foto
      </p>

      {/* Área de recorte */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 300, background: "#0f172a" }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, area) => setCroppedArea(area)}
          style={{
            containerStyle: { borderRadius: 16 },
            cropAreaStyle:  { border: `2.5px solid ${accentColor}`, boxShadow: `0 0 0 9999px rgba(0,0,0,0.60)` },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 px-1">
        <ZoomOut size={16} style={{ color: "#667085", flexShrink: 0 }} />
        <input type="range" min={1} max={3} step={0.01} value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
          style={{ accentColor }} />
        <ZoomIn size={16} style={{ color: "#667085", flexShrink: 0 }} />
      </div>

      {/* Acciones */}
      <div className="flex justify-between gap-3 pt-1">
        <button type="button" onClick={onCancel} disabled={uploading}
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
          style={{ borderColor: "#d0d5dd", color: "#344054", fontFamily: "var(--font-poppins),sans-serif" }}>
          <RotateCcw size={14} />Volver
        </button>
        <button type="button" onClick={() => croppedArea && onConfirm(croppedArea)} disabled={uploading || !croppedArea}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: accentColor, fontFamily: "var(--font-poppins),sans-serif" }}>
          {uploading ? <><RefreshCw size={14} className="animate-spin" />Guardando...</> : <><Check size={14} />Guardar foto</>}
        </button>
      </div>
    </div>
  );
}

// ─── Botón de acción del visor ────────────────────────────────────────────────

function AccionBtn({ icon, label, onClick, danger = false, disabled = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex flex-1 flex-col items-center gap-2 rounded-2xl border py-4 transition hover:border-transparent disabled:opacity-50"
      style={{
        borderColor: danger ? "#fecaca" : "#eaecf0",
        backgroundColor: danger ? "#fef2f2" : "#f8fafc",
      }}
      onMouseEnter={e => !disabled && ((e.currentTarget.style.backgroundColor = danger ? "#fee2e2" : "#f2f4f7"))}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = danger ? "#fef2f2" : "#f8fafc")}
    >
      <span style={{ color: danger ? "#dc2626" : "#344054" }}>{icon}</span>
      <span className="text-xs font-semibold" style={{ color: danger ? "#b42318" : "#344054", fontFamily: "var(--font-poppins),sans-serif" }}>
        {label}
      </span>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FotoPerfilEditor({ username, fotoUrl, accentColor, size = 96, onFotoUpdated }: Props) {
  const [open,       setOpen]       = useState(false);
  const [vista,      setVista]      = useState<Vista>("inicio");
  const [fuenteTab,  setFuenteTab]  = useState<Fuente>("upload");
  const [imageSrc,   setImageSrc]   = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [removing,   setRemoving]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const cerrar = useCallback(() => {
    setOpen(false);
    setVista("inicio");
    setImageSrc(null);
    setError(null);
    setFuenteTab("upload");
  }, []);

  /* Abre el modal en la vista correcta según tenga foto o no */
  const abrir = useCallback(() => {
    setOpen(true);
    setVista(fotoUrl ? "visor" : "fuente");
  }, [fotoUrl]);

  /* Archivo seleccionado (upload o cámara) → va directamente al recorte */
  const handleArchivoSeleccionado = useCallback((file: File) => {
    const err = validarArchivo(file);
    if (err) { setError(err); return; }
    setError(null);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setVista("recorte");
  }, []);

  /* Recorte confirmado → genera Blob → sube */
  const handleRecorteConfirmado = useCallback(async (area: Area) => {
    if (!imageSrc) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(imageSrc, area);
      const file = blobToFile(blob);
      const updated = await usuarioService.subirFoto(file);
      onFotoUpdated(updated.fotoUrl ?? null);
      cerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }, [imageSrc, onFotoUpdated, cerrar]);

  /* Recortar la foto existente */
  const handleAjustarEncuadre = useCallback(() => {
    if (!fotoUrl) return;
    setImageSrc(fotoUrl);
    setVista("recorte");
  }, [fotoUrl]);

  /* Eliminar */
  const handleEliminar = useCallback(async () => {
    setRemoving(true);
    setError(null);
    try {
      await usuarioService.eliminarFoto();
      onFotoUpdated(null);
      cerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la foto.");
    } finally {
      setRemoving(false);
    }
  }, [onFotoUpdated, cerrar]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <AvatarOverlay username={username} fotoUrl={fotoUrl} accentColor={accentColor} size={size} onClick={abrir} />

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" onClick={cerrar}
              style={{ backgroundColor: "rgba(16,24,40,0.55)", backdropFilter: "blur(4px)" }} />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border bg-white"
              style={{ borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(16,24,40,0.20)" }}>

              {/* Header dinámico */}
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#eaecf0" }}>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins),sans-serif" }}>
                    {vista === "visor"  && "Foto de perfil"}
                    {vista === "fuente" && "Nueva foto"}
                    {vista === "recorte" && "Ajustar encuadre"}
                  </h3>
                  <p className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins),sans-serif" }}>
                    {vista === "visor"   && "Gestiona tu foto de perfil"}
                    {vista === "fuente"  && "Sube un archivo o toma una foto"}
                    {vista === "recorte" && "Mueve y amplía para elegir la zona visible"}
                  </p>
                </div>
                <button onClick={cerrar}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-gray-100"
                  style={{ color: "#667085" }}>
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Error global */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 flex items-center gap-2 overflow-hidden rounded-2xl border px-4 py-3"
                      style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
                      <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
                      <span className="text-xs font-medium" style={{ color: "#b42318", fontFamily: "var(--font-poppins),sans-serif" }}>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {/* ── VISOR (tiene foto) ── */}
                  {vista === "visor" && fotoUrl && (
                    <motion.div key="visor" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }} className="flex flex-col items-center gap-5">

                      {/* Foto actual grande */}
                      <div className="overflow-hidden rounded-full border-4 border-white shadow-xl"
                        style={{ width: 140, height: 140 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={fotoUrl} alt={username} className="h-full w-full object-cover" />
                      </div>

                      {/* Tres acciones */}
                      <div className="flex w-full gap-3">
                        <AccionBtn icon={<Crop size={20} />}   label="Ajustar encuadre" onClick={handleAjustarEncuadre} />
                        <AccionBtn icon={<Upload size={20} />} label="Cambiar foto"      onClick={() => setVista("fuente")} />
                        <AccionBtn
                          icon={removing ? <RefreshCw size={20} className="animate-spin" /> : <Trash2 size={20} />}
                          label={removing ? "Eliminando…" : "Quitar foto"}
                          onClick={() => void handleEliminar()}
                          disabled={removing}
                          danger
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* ── FUENTE (selección de método) ── */}
                  {vista === "fuente" && (
                    <motion.div key="fuente" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }} className="flex flex-col gap-4">

                      {/* Tabs */}
                      <div className="flex rounded-2xl p-1" style={{ backgroundColor: "#f2f4f7" }}>
                        {(["upload", "camera"] as Fuente[]).map(t => (
                          <button key={t} type="button" onClick={() => setFuenteTab(t)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition"
                            style={{
                              backgroundColor: fuenteTab === t ? "#fff" : "transparent",
                              color: fuenteTab === t ? accentColor : "#667085",
                              boxShadow: fuenteTab === t ? "0 1px 4px rgba(16,24,40,0.08)" : "none",
                              fontFamily: "var(--font-poppins),sans-serif",
                            }}>
                            {t === "upload" ? <Upload size={15} /> : <Camera size={15} />}
                            {t === "upload" ? "Subir archivo" : "Tomar foto"}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div key={fuenteTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                          {fuenteTab === "upload"
                            ? <ZonaArchivo onFile={handleArchivoSeleccionado} accentColor={accentColor} />
                            : <CamaraCaptura onCapture={handleArchivoSeleccionado} accentColor={accentColor} />}
                        </motion.div>
                      </AnimatePresence>

                      {/* Volver (solo si tenía foto) */}
                      {fotoUrl && (
                        <button type="button" onClick={() => setVista("visor")}
                          className="mt-1 text-xs font-medium underline underline-offset-2 transition"
                          style={{ color: "#667085", fontFamily: "var(--font-poppins),sans-serif" }}>
                          ← Volver a la foto actual
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* ── RECORTE ── */}
                  {vista === "recorte" && imageSrc && (
                    <motion.div key="recorte" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}>
                      <EditorRecorte
                        imageSrc={imageSrc}
                        accentColor={accentColor}
                        uploading={uploading}
                        onConfirm={area => void handleRecorteConfirmado(area)}
                        onCancel={() => {
                          // Si venía de un archivo nuevo, vuelve a selección
                          // Si venía del visor (recortar foto existente), vuelve al visor
                          setVista(fotoUrl && imageSrc === fotoUrl ? "visor" : "fuente");
                          setImageSrc(null);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

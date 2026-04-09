"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface WarehouseRequestActionsProps {
  requestId: string;
  loading?: boolean;
  disabled?: boolean;
  onConfirm: (id: string) => void | Promise<unknown>;
  onReject: (id: string, reason: string) => void | Promise<unknown>;
}

export default function WarehouseRequestActions({
  requestId,
  loading = false,
  disabled = false,
  onConfirm,
  onReject,
}: WarehouseRequestActionsProps) {
  const [openReject, setOpenReject] = useState(false);
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const isDisabled = disabled || loading;

  async function handleReject() {
    if (!reason.trim()) {
      setLocalError("Debes escribir el motivo del rechazo.");
      return;
    }

    setLocalError(null);
    await onReject(requestId, reason.trim());
    setReason("");
    setOpenReject(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setOpenReject(true)}
          className="rounded-xl border px-3 py-2 text-xs font-semibold transition"
          style={{
            borderColor: "#fecaca",
            backgroundColor: "#fff5f5",
            color: "#b42318",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.7 : 1,
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Rechazar
        </button>
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => void onConfirm(requestId)}
          className="rounded-xl border px-3 py-2 text-xs font-semibold text-white transition"
          style={{
            borderColor: "#15803d",
            backgroundColor: "#15803d",
            color: "#ffffff",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.7 : 1,
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {loading ? "Procesando..." : "Confirmar"}
        </button>
      </div>

      <AnimatePresence>
        {openReject ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
            onClick={() => {
              setOpenReject(false);
              setLocalError(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-3xl border p-6"
              style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 24px 64px rgba(15, 23, 42, 0.22)" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: "#fef3f2", color: "#b42318" }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Rechazar solicitud
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Registra el motivo fisico o documental del rechazo.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
                  Motivo de rechazo
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Ejemplo: faltante fisico, danado, referencia incorrecta"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "#d0d5dd", color: "#101828", resize: "none", fontFamily: "var(--font-poppins), sans-serif" }}
                />
              </div>

              {localError ? (
                <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {localError}
                </div>
              ) : null}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenReject(false);
                    setLocalError(null);
                  }}
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold transition"
                  style={{ borderColor: "#d0d5dd", color: "#475467", backgroundColor: "#ffffff", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleReject()}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: "#b42318", opacity: loading ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  <CheckCircle2 size={15} />
                  Guardar rechazo
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

"use client";

interface RequestActionsProps {
  requestId: string;
  disabled?: boolean;
  loading?: boolean;
  onApprove: (id: string) => void | Promise<unknown>;
  onReject: (id: string) => void | Promise<unknown>;
}

export default function RequestActions({
  requestId,
  disabled = false,
  loading = false,
  onApprove,
  onReject,
}: RequestActionsProps) {
  const isDisabled = disabled || loading;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => void onReject(requestId)}
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
        onClick={() => void onApprove(requestId)}
        className="rounded-xl border px-3 py-2 text-xs font-semibold text-white transition"
        style={{
          borderColor: "#0b3d91",
          backgroundColor: "#0b3d91",
          color: "#ffffff",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.7 : 1,
          fontFamily: "var(--font-poppins), sans-serif",
        }}
      >
        {loading ? "Procesando..." : "Aprobar"}
      </button>
    </div>
  );
}

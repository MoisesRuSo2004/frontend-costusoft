import type { WarehouseRequestStatus } from "@/app/types/bodega-request";

const STATUS_STYLES: Record<
  WarehouseRequestStatus,
  { label: string; background: string; color: string }
> = {
  PENDIENTE: { label: "Pendiente", background: "#fff7e6", color: "#b76e00" },
  CONFIRMADA: { label: "Confirmada", background: "#ecfdf3", color: "#027a48" },
  RECHAZADA: { label: "Rechazada", background: "#fef3f2", color: "#b42318" },
};

export default function WarehouseStatusBadge({
  status,
}: {
  status: WarehouseRequestStatus;
}) {
  const current = STATUS_STYLES[status];

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: current.background,
        color: current.color,
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {current.label}
    </span>
  );
}

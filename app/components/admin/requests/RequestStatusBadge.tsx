import type { AdminRequestStatus } from "@/app/types/admin-request";

const STATUS_STYLES: Record<
  AdminRequestStatus,
  { label: string; background: string; color: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    background: "#fff7e6",
    color: "#b76e00",
  },
  APROBADO: {
    label: "Aprobado",
    background: "#ecfdf3",
    color: "#027a48",
  },
  RECHAZADO: {
    label: "Rechazado",
    background: "#fef3f2",
    color: "#b42318",
  },
};

export default function RequestStatusBadge({
  status,
}: {
  status: AdminRequestStatus;
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

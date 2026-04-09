import WarehouseRequestActions from "@/app/components/bodega/requests/WarehouseRequestActions";
import WarehouseStatusBadge from "@/app/components/bodega/requests/WarehouseStatusBadge";
import type { WarehouseRequest } from "@/app/types/bodega-request";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function typeLabel(type: WarehouseRequest["type"]) {
  return type === "ENTRADA" ? "Entrada" : "Salida";
}

export default function WarehouseQueueTable({
  requests,
  actionId,
  onConfirm,
  onReject,
}: {
  requests: WarehouseRequest[];
  actionId: string | null;
  onConfirm: (id: string) => void | Promise<unknown>;
  onReject: (id: string, reason: string) => void | Promise<unknown>;
}) {
  if (requests.length === 0) {
    return (
      <div
        className="rounded-3xl border border-dashed p-10 text-center"
        style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff" }}
      >
        <h3
          className="text-base font-semibold"
          style={{
            color: "#101828",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          No hay solicitudes en esta bandeja
        </h3>
        <p
          className="mt-2 text-sm"
          style={{
            color: "#667085",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Cuando lleguen nuevas solicitudes apareceran aqui para validacion.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{
        borderColor: "#eaecf0",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              {["Codigo", "Tipo", "Solicitante", "Detalle", "Estado", "Acciones"].map((label) => (
                <th
                  key={label}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]"
                  style={{
                    color: "#667085",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const isPending = request.status === "PENDIENTE";
              const loading = actionId === request.id;

              return (
                <tr key={request.id} className="border-t" style={{ borderColor: "#f2f4f7" }}>
                  <td className="px-6 py-4 align-top">
                    <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {request.code}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {formatDate(request.createdAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: request.type === "ENTRADA" ? "#eff8ff" : "#fff4ed",
                        color: request.type === "ENTRADA" ? "#175cd3" : "#c4320a",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {typeLabel(request.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {request.requestedBy.name}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {request.requestedBy.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {request.lines.map((line) => `${line.itemName} (${line.quantity} ${line.unit})`).join(", ")}
                      </p>
                      <p className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {request.description}
                      </p>
                      {request.rejectionReason ? (
                        <p className="text-xs" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
                          Motivo: {request.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-2">
                      <WarehouseStatusBadge status={request.status} />
                      {request.confirmedBy ? (
                        <p className="text-xs" style={{ color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}>
                          Confirmada por {request.confirmedBy}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <WarehouseRequestActions
                      requestId={request.id}
                      disabled={!isPending}
                      loading={loading}
                      onConfirm={onConfirm}
                      onReject={onReject}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

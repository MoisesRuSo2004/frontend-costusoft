import UserRequestStatusBadge from "@/app/components/user/requests/UserRequestStatusBadge";
import type { UserInventoryRequest } from "@/app/types/user-request";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function typeLabel(type: UserInventoryRequest["type"]) {
  return type === "ENTRADA" ? "Entrada" : "Salida";
}

export default function UserRequestsTable({
  requests,
}: {
  requests: UserInventoryRequest[];
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
          Aun no tienes solicitudes registradas
        </h3>
        <p
          className="mt-2 text-sm"
          style={{
            color: "#667085",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Cuando crees una nueva solicitud aparecera aqui con su estado.
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
              {["Codigo", "Tipo", "Detalle", "Fecha", "Estado", "Observacion"].map(
                (label) => (
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
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t" style={{ borderColor: "#f2f4f7" }}>
                <td className="px-6 py-4 align-top">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {request.code}
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
                  <div className="space-y-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {request.lines.map((line) => `${line.itemName} (${line.quantity} ${line.unit})`).join(", ")}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {request.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <p
                    className="text-sm"
                    style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {formatDate(request.createdAt)}
                  </p>
                </td>
                <td className="px-6 py-4 align-top">
                  <UserRequestStatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 align-top">
                  <p
                    className="text-xs"
                    style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {request.rejectionReason || request.confirmedBy || "Esperando validacion de bodega"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

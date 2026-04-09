import RequestActions from "@/app/components/admin/requests/RequestActions";
import RequestStatusBadge from "@/app/components/admin/requests/RequestStatusBadge";
import type { RequestItem } from "@/app/types/admin-request";

interface RequestsTableProps {
  requests: RequestItem[];
  actionId: string | null;
  onApprove: (id: string) => void | Promise<unknown>;
  onReject: (id: string) => void | Promise<unknown>;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function RequestsTable({
  requests,
  actionId,
  onApprove,
  onReject,
}: RequestsTableProps) {
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
          No hay solicitudes registradas
        </h3>
        <p
          className="mt-2 text-sm"
          style={{
            color: "#667085",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Cuando los usuarios creen nuevas solicitudes apareceran aqui para su
          revision.
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
              {[
                "Solicitud",
                "Solicitante",
                "Insumo",
                "Fecha",
                "Estado",
                "Acciones",
              ].map((label) => (
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
              const isLoading = actionId === request.id;

              return (
                <tr
                  key={request.id}
                  className="border-t"
                  style={{ borderColor: "#f2f4f7" }}
                >
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: "#101828",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {request.title}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: "#475467",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {request.code}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: "#667085",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {request.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1">
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: "#101828",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {request.requestedBy.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: "#667085",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {request.requestedBy.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: "#101828",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {request.itemName}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "#667085",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {request.quantity} {request.unit}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p
                      className="text-sm"
                      style={{
                        color: "#475467",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {formatDate(request.createdAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <RequestStatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <RequestActions
                      requestId={request.id}
                      disabled={!isPending}
                      loading={isLoading}
                      onApprove={onApprove}
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

export type AdminRequestStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

export type SystemRole = "ADMIN" | "USER" | "BODEGA";

export interface RequestItem {
  id: string;
  code: string;
  title: string;
  description: string;
  itemName: string;
  quantity: number;
  unit: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    role: SystemRole;
  };
  status: AdminRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestsSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface GetRequestsResponse {
  data: RequestItem[];
  summary: RequestsSummary;
}

export interface RequestActionResponse {
  data: RequestItem;
  message: string;
}

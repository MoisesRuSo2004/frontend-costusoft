export type BodegaRole = "BODEGA";
export type WarehouseRequestType = "ENTRADA" | "SALIDA";
export type WarehouseRequestStatus = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA";

export interface WarehouseRequestLine {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  availableStock?: number;
}

export interface WarehouseRequestUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface WarehouseOperator {
  id: string;
  name: string;
  email: string;
  role: BodegaRole;
}

export interface WarehouseRequest {
  id: string;
  code: string;
  type: WarehouseRequestType;
  status: WarehouseRequestStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: WarehouseRequestUser;
  lines: WarehouseRequestLine[];
  confirmedBy?: string | null;
  rejectionReason?: string | null;
}

export interface WarehouseSummary {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
}

export interface WarehouseDashboardResponse {
  currentOperator: WarehouseOperator;
  requests: WarehouseRequest[];
  summary: WarehouseSummary;
}

export interface WarehouseActionResponse {
  data: WarehouseRequest;
  message: string;
}

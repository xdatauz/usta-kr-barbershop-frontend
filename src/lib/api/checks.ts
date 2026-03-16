import { apiRequest } from "./client";

export type CheckStatus = "OPEN" | "CLOSED";

export interface CheckItem {
	serviceId: number;
	serviceName?: string;
	quantity: number;
	price: number;
}

export interface Check {
	id: number;
	appointmentId?: number;
	status: CheckStatus;
	items: CheckItem[];
	subtotal: number;
	discountAmount: number;
	total: number;
	createdAt: string;
}

const toNum = (v: unknown, fallback = 0): number =>
	typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : fallback;

const normalizeItem = (raw: unknown): CheckItem | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;
	const serviceId = toNum(src.serviceId, -1);
	if (serviceId < 0) return null;
	return {
		serviceId,
		serviceName: typeof src.serviceName === "string" ? src.serviceName : undefined,
		quantity: toNum(src.quantity, 1),
		price: toNum(src.price),
	};
};

const normalizeCheck = (raw: unknown): Check | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	const rawItems = Array.isArray(src.items) ? src.items : [];

	return {
		id,
		appointmentId: typeof src.appointmentId === "number" ? src.appointmentId : undefined,
		status: src.status === "CLOSED" ? "CLOSED" : "OPEN",
		items: rawItems.map(normalizeItem).filter((i): i is CheckItem => i !== null),
		subtotal: toNum(src.subtotal),
		discountAmount: toNum(src.discountAmount),
		total: toNum(src.total),
		createdAt: typeof src.createdAt === "string" ? src.createdAt : new Date().toISOString(),
	};
};

/** POST /checks — open a new check */
export const createCheckApi = async (payload: { appointmentId?: number }): Promise<Check> => {
	const response = await apiRequest<unknown>("/checks", { method: "POST", auth: true, body: payload });
	const check = normalizeCheck(response);
	if (!check) throw new Error("Invalid check response");
	return check;
};

/** PATCH /checks/:id/add-item */
export const addCheckItemApi = async (id: number, payload: { serviceId: number; quantity?: number }): Promise<Check> => {
	const response = await apiRequest<unknown>(`/checks/${id}/add-item`, { method: "PATCH", auth: true, body: payload });
	const check = normalizeCheck(response);
	if (!check) throw new Error("Invalid check response");
	return check;
};

/** PATCH /checks/:id/discount — ADMIN only */
export const applyDiscountApi = async (id: number, payload: { discountPercent?: number; discountAmount?: number }): Promise<Check> => {
	const response = await apiRequest<unknown>(`/checks/${id}/discount`, { method: "PATCH", auth: true, body: payload });
	const check = normalizeCheck(response);
	if (!check) throw new Error("Invalid check response");
	return check;
};

/** PATCH /checks/:id/close */
export const closeCheckApi = async (id: number): Promise<Check> => {
	const response = await apiRequest<unknown>(`/checks/${id}/close`, { method: "PATCH", auth: true });
	const check = normalizeCheck(response);
	if (!check) throw new Error("Invalid check response");
	return check;
};

import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray } from "./normalizers";

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

const normalizeItem = (raw: unknown): CheckItem | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;
	const serviceId = normalizeNumber(src.serviceId, -1);
	if (serviceId < 0) return null;
	return {
		serviceId,
		serviceName: typeof src.serviceName === "string" ? src.serviceName : undefined,
		quantity: normalizeNumber(src.quantity, 1),
		price: normalizeNumber(src.price),
	};
};

const normalizeCheck = (raw: unknown): Check | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	const rawItems = Array.isArray(src.items) ? src.items : [];

	return {
		id,
		appointmentId: typeof src.appointmentId === "number" ? src.appointmentId : undefined,
		status: src.status === "CLOSED" ? "CLOSED" : "OPEN",
		items: normalizeArray(rawItems, normalizeItem),
		subtotal: normalizeNumber(src.subtotal),
		discountAmount: normalizeNumber(src.discountAmount),
		total: normalizeNumber(src.total),
		createdAt: normalizeString(src.createdAt, new Date().toISOString()),
	};
};

/** POST /checks — open a new check */
export const createCheckApi = async (payload: { appointmentId?: number }): Promise<Check> => {
	const { data } = await api.post<unknown>("/checks", payload);
	const check = normalizeCheck(data);
	if (!check) throw new Error("Invalid check response");
	return check;
};

/** PATCH /checks/:id/add-item */
export const addCheckItemApi = async (id: number, payload: { serviceId: number; quantity?: number }): Promise<Check> => {
	const { data } = await api.patch<unknown>(`/checks/${id}/add-item`, payload);
	const check = normalizeCheck(data);
	if (!check) throw new Error("Invalid check response");
	return check;
};

/** PATCH /checks/:id/discount — ADMIN only */
export const applyDiscountApi = async (id: number, payload: { discountPercent?: number; discountAmount?: number }): Promise<Check> => {
	const { data } = await api.patch<unknown>(`/checks/${id}/discount`, payload);
	const check = normalizeCheck(data);
	if (!check) throw new Error("Invalid check response");
	return check;
};

/** PATCH /checks/:id/close */
export const closeCheckApi = async (id: number): Promise<Check> => {
	const { data } = await api.patch<unknown>(`/checks/${id}/close`);
	const check = normalizeCheck(data);
	if (!check) throw new Error("Invalid check response");
	return check;
};

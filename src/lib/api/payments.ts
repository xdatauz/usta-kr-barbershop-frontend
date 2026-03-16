import { apiRequest } from "./client";

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";

export interface Payment {
	id: number;
	checkId: number;
	amount: number;
	method: PaymentMethod;
	createdAt: string;
}

export interface PaymentCreatePayload {
	checkId: number;
	amount: number;
	method: PaymentMethod;
}

const toNum = (v: unknown, fallback = 0): number =>
	typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : fallback;

const validMethods: PaymentMethod[] = ["CASH", "CARD", "TRANSFER", "OTHER"];

const normalizePayment = (raw: unknown): Payment | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		checkId: toNum(src.checkId),
		amount: toNum(src.amount),
		method: validMethods.includes(src.method as PaymentMethod) ? (src.method as PaymentMethod) : "CASH",
		createdAt: typeof src.createdAt === "string" ? src.createdAt : new Date().toISOString(),
	};
};

const extractList = (response: unknown): unknown[] => {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== "object") return [];
	const src = response as Record<string, unknown>;
	return Array.isArray(src.items) ? src.items : [];
};

/** POST /payments */
export const createPaymentApi = async (payload: PaymentCreatePayload): Promise<Payment> => {
	const response = await apiRequest<unknown>("/payments", { method: "POST", auth: true, body: payload });
	const payment = normalizePayment(response);
	if (!payment) throw new Error("Invalid payment response");
	return payment;
};

/** GET /payments — ADMIN */
export const getPaymentsApi = async (params: { from?: string; to?: string } = {}): Promise<Payment[]> => {
	const q = new URLSearchParams();
	if (params.from) q.set("from", params.from);
	if (params.to) q.set("to", params.to);
	const qs = q.toString();

	const response = await apiRequest<unknown>(`/payments${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
	return extractList(response)
		.map(normalizePayment)
		.filter((p): p is Payment => p !== null);
};

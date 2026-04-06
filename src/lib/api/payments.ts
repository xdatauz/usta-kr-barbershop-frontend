import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray, extractList } from "./normalizers";

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

const validMethods: PaymentMethod[] = ["CASH", "CARD", "TRANSFER", "OTHER"];

const normalizePayment = (raw: unknown): Payment | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		checkId: normalizeNumber(src.checkId),
		amount: normalizeNumber(src.amount),
		method: validMethods.includes(src.method as PaymentMethod) ? (src.method as PaymentMethod) : "CASH",
		createdAt: normalizeString(src.createdAt, new Date().toISOString()),
	};
};

/** POST /payments */
export const createPaymentApi = async (payload: PaymentCreatePayload): Promise<Payment> => {
	const { data } = await api.post<unknown>("/payments", payload);
	const payment = normalizePayment(data);
	if (!payment) throw new Error("Invalid payment response");
	return payment;
};

/** GET /payments — ADMIN */
export const getPaymentsApi = async (params: { from?: string; to?: string } = {}): Promise<Payment[]> => {
	const { data } = await api.get<unknown>("/payments", { params });
	return normalizeArray(extractList(data), normalizePayment);
};

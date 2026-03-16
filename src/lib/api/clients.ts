import { apiRequest } from "./client";

export interface CrmClient {
	id: number;
	name: string;
	phone: string;
	email?: string;
	note?: string;
	createdAt: string;
}

export interface CrmClientCreatePayload {
	name: string;
	phone: string;
	email?: string;
	note?: string;
}

const toNum = (v: unknown, fallback = 0): number =>
	typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : fallback;

const normalizeClient = (raw: unknown): CrmClient | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: typeof src.name === "string" ? src.name : "",
		phone: typeof src.phone === "string" ? src.phone : "",
		email: typeof src.email === "string" ? src.email : undefined,
		note: typeof src.note === "string" ? src.note : undefined,
		createdAt: typeof src.createdAt === "string" ? src.createdAt : new Date().toISOString(),
	};
};

const extractList = (response: unknown): unknown[] => {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== "object") return [];
	const src = response as Record<string, unknown>;
	return Array.isArray(src.items) ? src.items : [];
};

export const getClientsApi = async (): Promise<CrmClient[]> => {
	const response = await apiRequest<unknown>("/clients", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeClient)
		.filter((c): c is CrmClient => c !== null);
};

export const getClientByPhoneApi = async (phone: string): Promise<CrmClient | null> => {
	const response = await apiRequest<unknown>(`/clients/by-phone?phone=${encodeURIComponent(phone)}`, {
		method: "GET",
		auth: true,
	});
	return normalizeClient(response);
};

export const getClientApi = async (id: number): Promise<CrmClient> => {
	const response = await apiRequest<unknown>(`/clients/${id}`, { method: "GET", auth: true });
	const client = normalizeClient(response);
	if (!client) throw new Error("Invalid client response");
	return client;
};

export const createClientApi = async (payload: CrmClientCreatePayload): Promise<CrmClient> => {
	const response = await apiRequest<unknown>("/clients", { method: "POST", auth: true, body: payload });
	const client = normalizeClient(response);
	if (!client) throw new Error("Invalid client response");
	return client;
};

export const updateClientApi = async (id: number, payload: Partial<CrmClientCreatePayload>): Promise<CrmClient> => {
	const response = await apiRequest<unknown>(`/clients/${id}`, { method: "PATCH", auth: true, body: payload });
	const client = normalizeClient(response);
	if (!client) throw new Error("Invalid client response");
	return client;
};

export const deleteClientApi = async (id: number): Promise<void> => {
	await apiRequest(`/clients/${id}`, { method: "DELETE", auth: true });
};

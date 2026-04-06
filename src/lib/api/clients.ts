import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray, extractList } from "./normalizers";

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

const normalizeClient = (raw: unknown): CrmClient | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: normalizeString(src.name),
		phone: normalizeString(src.phone),
		email: typeof src.email === "string" ? src.email : undefined,
		note: typeof src.note === "string" ? src.note : undefined,
		createdAt: normalizeString(src.createdAt, new Date().toISOString()),
	};
};

export const getClientsApi = async (): Promise<CrmClient[]> => {
	const { data } = await api.get<unknown>("/clients");
	return normalizeArray(extractList(data), normalizeClient);
};

export const getClientByPhoneApi = async (phone: string): Promise<CrmClient | null> => {
	const { data } = await api.get<unknown>("/clients/by-phone", {
		params: { phone },
	});
	return normalizeClient(data);
};

export const getClientApi = async (id: number): Promise<CrmClient> => {
	const { data } = await api.get<unknown>(`/clients/${id}`);
	const client = normalizeClient(data);
	if (!client) throw new Error("Invalid client response");
	return client;
};

export const createClientApi = async (payload: CrmClientCreatePayload): Promise<CrmClient> => {
	const { data } = await api.post<unknown>("/clients", payload);
	const client = normalizeClient(data);
	if (!client) throw new Error("Invalid client response");
	return client;
};

export const updateClientApi = async (id: number, payload: Partial<CrmClientCreatePayload>): Promise<CrmClient> => {
	const { data } = await api.patch<unknown>(`/clients/${id}`, payload);
	const client = normalizeClient(data);
	if (!client) throw new Error("Invalid client response");
	return client;
};

export const deleteClientApi = async (id: number): Promise<void> => {
	await api.delete(`/clients/${id}`);
};

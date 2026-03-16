import { apiRequest } from "./client";

export interface Service {
	id: number;
	name: string;
	description?: string;
	price: number;
	durationMinutes: number;
	isActive: boolean;
}

export interface ServiceCreatePayload {
	name: string;
	description?: string;
	price: number;
	durationMinutes: number;
}

const toNum = (v: unknown, fallback = 0): number =>
	typeof v === "number" && Number.isFinite(v) ? v : Number.isFinite(Number(v)) ? Number(v) : fallback;

const normalizeService = (raw: unknown): Service | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: typeof src.name === "string" ? src.name : "",
		description: typeof src.description === "string" ? src.description : undefined,
		price: toNum(src.price),
		// Backend uses 'duration', frontend interface uses durationMinutes
		durationMinutes: toNum(src.durationMinutes ?? src.durationMin ?? src.duration, 30),
		isActive: src.isActive !== false,
	};
};

const extractList = (response: unknown): unknown[] => {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== "object") return [];
	const src = response as Record<string, unknown>;
	return Array.isArray(src.items) ? src.items : [];
};

/** Admin: all services */
export const getServicesApi = async (): Promise<Service[]> => {
	const response = await apiRequest<unknown>("/services", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeService)
		.filter((s): s is Service => s !== null);
};

/** Public: active services only */
export const getPublicServicesApi = async (): Promise<Service[]> => {
	const response = await apiRequest<unknown>("/services/public", { method: "GET" });
	return extractList(response)
		.map(normalizeService)
		.filter((s): s is Service => s !== null);
};

export const getServiceApi = async (id: number): Promise<Service> => {
	const response = await apiRequest<unknown>(`/services/${id}`, { method: "GET", auth: true });
	const service = normalizeService(response);
	if (!service) throw new Error("Invalid service response");
	return service;
};

export const createServiceApi = async (payload: ServiceCreatePayload): Promise<Service> => {
	const response = await apiRequest<unknown>("/services", { method: "POST", auth: true, body: payload });
	const service = normalizeService(response);
	if (!service) throw new Error("Invalid service response");
	return service;
};

export const updateServiceApi = async (id: number, payload: Partial<ServiceCreatePayload>): Promise<Service> => {
	const response = await apiRequest<unknown>(`/services/${id}`, { method: "PATCH", auth: true, body: payload });
	const service = normalizeService(response);
	if (!service) throw new Error("Invalid service response");
	return service;
};

export const deleteServiceApi = async (id: number): Promise<void> => {
	await apiRequest(`/services/${id}`, { method: "DELETE", auth: true });
};

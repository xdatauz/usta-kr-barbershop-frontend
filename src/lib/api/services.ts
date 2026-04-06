import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray, extractList } from "./normalizers";

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

const normalizeService = (raw: unknown): Service | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: normalizeString(src.name),
		description: typeof src.description === "string" ? src.description : undefined,
		price: normalizeNumber(src.price),
		// Backend uses 'duration', frontend interface uses durationMinutes
		durationMinutes: normalizeNumber(src.durationMinutes ?? src.durationMin ?? src.duration, 30),
		isActive: src.isActive !== false,
	};
};

/** Admin: all services */
export const getServicesApi = async (): Promise<Service[]> => {
	const { data } = await api.get<unknown>("/services");
	return normalizeArray(extractList(data), normalizeService);
};

/** Public: active services only */
export const getPublicServicesApi = async (): Promise<Service[]> => {
	const { data } = await api.get<unknown>("/services/public");
	return normalizeArray(extractList(data), normalizeService);
};

export const getServiceApi = async (id: number): Promise<Service> => {
	const { data } = await api.get<unknown>(`/services/${id}`);
	const service = normalizeService(data);
	if (!service) throw new Error("Invalid service response");
	return service;
};

export const createServiceApi = async (payload: ServiceCreatePayload): Promise<Service> => {
	const { data } = await api.post<unknown>("/services", payload);
	const service = normalizeService(data);
	if (!service) throw new Error("Invalid service response");
	return service;
};

export const updateServiceApi = async (id: number, payload: Partial<ServiceCreatePayload>): Promise<Service> => {
	const { data } = await api.patch<unknown>(`/services/${id}`, payload);
	const service = normalizeService(data);
	if (!service) throw new Error("Invalid service response");
	return service;
};

export const deleteServiceApi = async (id: number): Promise<void> => {
	await api.delete(`/services/${id}`);
};

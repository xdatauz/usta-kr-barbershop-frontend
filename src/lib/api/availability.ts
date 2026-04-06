import api from "./client";
import { normalizeNumber, normalizeString } from "./normalizers";

export interface AvailableSlot {
	time: string;
	available: boolean;
}

export interface AvailableDate {
	date: string;
	available: boolean;
	slots?: number;
}

export interface AvailableBarber {
	id: number;
	name: string;
	available: boolean;
}

/** GET /availability — available time slots for a given date */
export const getAvailabilityApi = async (params: { date: string; barberId?: number; serviceId?: number }): Promise<AvailableSlot[]> => {
	const { data } = await api.get<unknown>("/availability", { params });

	const list = Array.isArray(data)
		? data
		: data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).slots)
			? ((data as { slots: unknown[] }).slots)
			: [];

	return list
		.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
		.map((item) => ({
			time: normalizeString(item.time),
			available: item.available !== false,
		}))
		.filter((s) => s.time);
};

/** GET /availability/dates — available booking dates */
export const getAvailableDatesApi = async (params: { barberId?: number; month?: string } = {}): Promise<AvailableDate[]> => {
	const { data } = await api.get<unknown>("/availability/dates", { params });

	const list = Array.isArray(data)
		? data
		: data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).dates)
			? ((data as { dates: unknown[] }).dates)
			: [];

	return list
		.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
		.map((item) => ({
			date: normalizeString(item.date),
			available: item.available !== false,
			slots: typeof item.slots === "number" ? item.slots : undefined,
		}))
		.filter((d) => d.date);
};

/** GET /availability/barbers — barbers available on a given date */
export const getAvailableBarbersApi = async (params: { date: string; serviceId?: number }): Promise<AvailableBarber[]> => {
	const { data } = await api.get<unknown>("/availability/barbers", { params });

	const list = Array.isArray(data)
		? data
		: data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).barbers)
			? ((data as { barbers: unknown[] }).barbers)
			: [];

	return list
		.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
		.map((item) => ({
			id: normalizeNumber(item.id),
			name: normalizeString(item.name),
			available: item.available !== false,
		}))
		.filter((b) => b.id > 0);
};

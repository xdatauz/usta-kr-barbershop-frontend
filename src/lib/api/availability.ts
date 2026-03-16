import { apiRequest } from "./client";

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

const buildQuery = (params: Record<string, string | number | undefined>): string => {
	const q = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) q.set(key, String(value));
	}
	return q.toString();
};

/** GET /availability — available time slots for a given date */
export const getAvailabilityApi = async (params: { date: string; barberId?: number; serviceId?: number }): Promise<AvailableSlot[]> => {
	const qs = buildQuery(params);
	const response = await apiRequest<unknown>(`/availability?${qs}`, { method: "GET" });

	const list = Array.isArray(response)
		? response
		: response && typeof response === "object" && Array.isArray((response as Record<string, unknown>).slots)
			? ((response as { slots: unknown[] }).slots)
			: [];

	return list
		.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
		.map((item) => ({ time: String(item.time ?? ""), available: item.available !== false }))
		.filter((s) => s.time);
};

/** GET /availability/dates — available booking dates */
export const getAvailableDatesApi = async (params: { barberId?: number; month?: string } = {}): Promise<AvailableDate[]> => {
	const qs = buildQuery(params);
	const response = await apiRequest<unknown>(`/availability/dates?${qs}`, { method: "GET" });

	const list = Array.isArray(response)
		? response
		: response && typeof response === "object" && Array.isArray((response as Record<string, unknown>).dates)
			? ((response as { dates: unknown[] }).dates)
			: [];

	return list
		.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
		.map((item) => ({
			date: String(item.date ?? ""),
			available: item.available !== false,
			slots: typeof item.slots === "number" ? item.slots : undefined,
		}))
		.filter((d) => d.date);
};

/** GET /availability/barbers — barbers available on a given date */
export const getAvailableBarbersApi = async (params: { date: string; serviceId?: number }): Promise<AvailableBarber[]> => {
	const qs = buildQuery(params);
	const response = await apiRequest<unknown>(`/availability/barbers?${qs}`, { method: "GET" });

	const list = Array.isArray(response)
		? response
		: response && typeof response === "object" && Array.isArray((response as Record<string, unknown>).barbers)
			? ((response as { barbers: unknown[] }).barbers)
			: [];

	return list
		.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
		.map((item) => ({
			id: typeof item.id === "number" ? item.id : parseInt(String(item.id ?? 0)),
			name: typeof item.name === "string" ? item.name : "",
			available: item.available !== false,
		}))
		.filter((b) => b.id > 0);
};

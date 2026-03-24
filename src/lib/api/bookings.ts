import { apiRequest } from "./client";

export interface MyBooking {
	id: string;
	barberId: string | null;
	date: string;
	time: string;
	style: string;
	status: string;
	createdAt: string | null;
}

export type BookingStyle = 'classic' | 'fade' | 'beard' | 'deluxe' | 'color' | 'fatherSon';

export interface BookingPayload {
	name: string;
	phone: string;
	barberId: string;
	date: string;
	time: string;
	style: BookingStyle;
	note?: string;
}

export interface BookingSlot {
	time: string;
	available: boolean;
}

export const getMyBookingsApi = async (): Promise<MyBooking[]> => {
	const response = await apiRequest<unknown>("/bookings/me", { method: "GET", auth: true });
	const list = Array.isArray(response) ? response : [];
	return list
		.map((item) => {
			if (!item || typeof item !== "object") return null;
			const src = item as Record<string, unknown>;
			const id = typeof src.id === "string" ? src.id : typeof src.id === "number" ? String(src.id) : null;
			if (!id) return null;
			return {
				id,
				barberId: typeof src.barberId === "string" ? src.barberId : null,
				date: typeof src.date === "string" ? src.date : "",
				time: typeof src.time === "string" ? src.time : "",
				style: typeof src.style === "string" ? src.style : "",
				status: typeof src.status === "string" ? src.status : "pending",
				createdAt: typeof src.createdAt === "string" ? src.createdAt : null,
			};
		})
		.filter((b): b is MyBooking => b !== null);
};

export const cancelMyBookingApi = async (id: string): Promise<void> => {
	await apiRequest<unknown>(`/bookings/${id}/cancel`, { method: "PATCH", auth: true });
};

export const createBookingApi = async (payload: BookingPayload) => {
	return apiRequest("/bookings", {
		method: "POST",
		body: payload,
	});
};

export const getBookingSlotsApi = async (barberId: string, date: string): Promise<BookingSlot[]> => {
	const response = await apiRequest<unknown>(`/bookings/slots?date=${encodeURIComponent(date)}&barberId=${encodeURIComponent(barberId)}`, {
		method: "GET",
	});

	const slotsRaw =
		Array.isArray(response)
			? response
			: response && typeof response === "object" && Array.isArray((response as { slots?: unknown[] }).slots)
				? ((response as { slots: unknown[] }).slots ?? [])
				: [];

	return slotsRaw
		.map((item) => {
			// Backend may return plain time strings like ["09:00", "09:30"]
			if (typeof item === "string") {
				return { time: item, available: true };
			}
			if (!item || typeof item !== "object") {
				return null;
			}
			const source = item as { time?: unknown; available?: unknown };
			if (typeof source.time !== "string") {
				return null;
			}
			return {
				time: source.time,
				available: source.available !== false,
			};
		})
		.filter((item): item is BookingSlot => item !== null);
};

import { apiRequest } from "./client";

export interface BookingPayload {
	name: string;
	phone: string;
	barberId: string;
	date: string;
	time: string;
	style: string;
	note?: string;
}

export interface BookingSlot {
	time: string;
	available: boolean;
}

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

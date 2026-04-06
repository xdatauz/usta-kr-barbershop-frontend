import api from "./client";
import { normalizeId, normalizeString, normalizeBoolean } from "./normalizers";

export interface MyBooking {
	id: string;
	barberId: string | null;
	date: string;
	time: string;
	style: string;
	status: string;
	createdAt: string | null;
}

export type BookingStyle = "classic" | "fade" | "beard" | "deluxe" | "color" | "fatherSon";

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
	const { data } = await api.get<unknown>("/bookings/me");
	const list = Array.isArray(data) ? data : [];
	return list
		.map((item) => {
			if (!item || typeof item !== "object") return null;
			const src = item as Record<string, unknown>;
			const id = normalizeId(src.id);
			if (!id) return null;
			return {
				id,
				barberId: typeof src.barberId === "string" ? src.barberId : null,
				date: normalizeString(src.date),
				time: normalizeString(src.time),
				style: normalizeString(src.style),
				status: normalizeString(src.status, "pending"),
				createdAt: typeof src.createdAt === "string" ? src.createdAt : null,
			};
		})
		.filter((b): b is MyBooking => b !== null);
};

export const cancelMyBookingApi = async (id: string): Promise<void> => {
	await api.patch(`/bookings/${id}/cancel`);
};

export const createBookingApi = async (payload: BookingPayload) => {
	const { data } = await api.post("/bookings", payload);
	return data;
};

export const getBookingSlotsApi = async (barberId: string, date: string): Promise<BookingSlot[]> => {
	const { data } = await api.get<unknown>("/bookings/slots", {
		params: { date, barberId },
	});

	// Handle both { slots: [...] } (new) and { data: { slots: [...] } } (old)
	const src = data && typeof data === "object" ? data as Record<string, unknown> : {};
	const slotsRaw = Array.isArray(src.slots)
		? src.slots
		: (src.data && typeof src.data === "object" && Array.isArray((src.data as Record<string, unknown>).slots))
			? (src.data as Record<string, unknown>).slots as unknown[]
			: [];

	return (slotsRaw as unknown[])
		.map((item) => {
			if (!item || typeof item !== "object") return null;
			const source = item as { time?: unknown; available?: unknown };
			if (typeof source.time !== "string") return null;
			return {
				time: source.time,
				available: normalizeBoolean(source.available, true),
			};
		})
		.filter((item): item is BookingSlot => item !== null);
};

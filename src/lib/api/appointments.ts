import { apiRequest } from "./client";

export type AppointmentStatus =
	| "PENDING"
	| "CONFIRMED"
	| "CHECKED_IN"
	| "IN_SERVICE"
	| "COMPLETED"
	| "CANCELLED"
	| "NO_SHOW";

export interface Appointment {
	id: number;
	clientName: string;
	clientPhone: string;
	barberId: number;
	barberName?: string;
	serviceId?: number;
	serviceName?: string;
	date: string;
	time: string;
	status: AppointmentStatus;
	note?: string;
	createdAt: string;
}

export interface AppointmentCreatePayload {
	clientName: string;
	clientPhone: string;
	barberId: number;
	serviceId?: number;
	date: string;
	time: string;
	note?: string;
}

export interface AppointmentReschedulePayload {
	date: string;
	time: string;
}

const toNum = (v: unknown, fallback = 0): number =>
	typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : fallback;

const normalizeAppointment = (raw: unknown): Appointment | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	const validStatuses: AppointmentStatus[] = [
		"PENDING", "CONFIRMED", "CHECKED_IN", "IN_SERVICE", "COMPLETED", "CANCELLED", "NO_SHOW",
	];
	const status = validStatuses.includes(src.status as AppointmentStatus)
		? (src.status as AppointmentStatus)
		: "PENDING";

	return {
		id,
		clientName: typeof src.clientName === "string" ? src.clientName : "",
		clientPhone: typeof src.clientPhone === "string" ? src.clientPhone : "",
		barberId: toNum(src.barberId),
		barberName: typeof src.barberName === "string" ? src.barberName : undefined,
		serviceId: typeof src.serviceId === "number" ? src.serviceId : undefined,
		serviceName: typeof src.serviceName === "string" ? src.serviceName : undefined,
		date: typeof src.date === "string" ? src.date : "",
		time: typeof src.time === "string" ? src.time : "",
		status,
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

/** POST /appointments — public booking (no auth) */
export const createAppointmentApi = async (payload: AppointmentCreatePayload): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>("/appointments", { method: "POST", body: payload });
	return normalizeAppointment(response);
};

/** POST /appointments/client — booking by authenticated client */
export const createClientAppointmentApi = async (payload: AppointmentCreatePayload): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>("/appointments/client", { method: "POST", auth: true, body: payload });
	return normalizeAppointment(response);
};

/** GET /appointments — staff: all appointments */
export const getAppointmentsApi = async (params: { from?: string; to?: string; staffId?: number; status?: string } = {}): Promise<Appointment[]> => {
	const q = new URLSearchParams();
	if (params.from) q.set("from", params.from);
	if (params.to) q.set("to", params.to);
	if (params.staffId !== undefined) q.set("staffId", String(params.staffId));
	if (params.status) q.set("status", params.status);
	const qs = q.toString();

	const response = await apiRequest<unknown>(`/appointments${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeAppointment)
		.filter((a): a is Appointment => a !== null);
};

/** GET /appointments/my — client: own appointments */
export const getMyAppointmentsApi = async (): Promise<Appointment[]> => {
	const response = await apiRequest<unknown>("/appointments/my", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeAppointment)
		.filter((a): a is Appointment => a !== null);
};

/** GET /appointments/:id */
export const getAppointmentApi = async (id: number): Promise<Appointment> => {
	const response = await apiRequest<unknown>(`/appointments/${id}`, { method: "GET", auth: true });
	const appointment = normalizeAppointment(response);
	if (!appointment) throw new Error("Invalid appointment response");
	return appointment;
};

/** PATCH /appointments/:id/reschedule */
export const rescheduleAppointmentApi = async (id: number, payload: AppointmentReschedulePayload): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>(`/appointments/${id}/reschedule`, { method: "PATCH", body: payload });
	return normalizeAppointment(response);
};

/** PATCH /appointments/:id/cancel */
export const cancelAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>(`/appointments/${id}/cancel`, { method: "PATCH" });
	return normalizeAppointment(response);
};

/** PATCH /appointments/:id/confirm — ADMIN/RECEPTION */
export const confirmAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>(`/appointments/${id}/confirm`, { method: "PATCH", auth: true });
	return normalizeAppointment(response);
};

/** PATCH /appointments/:id/check-in — ADMIN/RECEPTION */
export const checkInAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>(`/appointments/${id}/check-in`, { method: "PATCH", auth: true });
	return normalizeAppointment(response);
};

/** PATCH /appointments/:id/start-service — Staff */
export const startServiceApi = async (id: number): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>(`/appointments/${id}/start-service`, { method: "PATCH", auth: true });
	return normalizeAppointment(response);
};

/** PATCH /appointments/:id/end-service — Staff */
export const endServiceApi = async (id: number): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>(`/appointments/${id}/end-service`, { method: "PATCH", auth: true });
	return normalizeAppointment(response);
};

/** PATCH /appointments/:id/no-show — ADMIN/RECEPTION */
export const noShowAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const response = await apiRequest<unknown>(`/appointments/${id}/no-show`, { method: "PATCH", auth: true });
	return normalizeAppointment(response);
};

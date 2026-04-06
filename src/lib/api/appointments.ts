import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray, extractList } from "./normalizers";

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

const validStatuses: AppointmentStatus[] = [
	"PENDING", "CONFIRMED", "CHECKED_IN", "IN_SERVICE", "COMPLETED", "CANCELLED", "NO_SHOW",
];

const normalizeAppointment = (raw: unknown): Appointment | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	const status = validStatuses.includes(src.status as AppointmentStatus)
		? (src.status as AppointmentStatus)
		: "PENDING";

	return {
		id,
		clientName: normalizeString(src.clientName),
		clientPhone: normalizeString(src.clientPhone),
		barberId: normalizeNumber(src.barberId),
		barberName: typeof src.barberName === "string" ? src.barberName : undefined,
		serviceId: typeof src.serviceId === "number" ? src.serviceId : undefined,
		serviceName: typeof src.serviceName === "string" ? src.serviceName : undefined,
		date: normalizeString(src.date),
		time: normalizeString(src.time),
		status,
		note: typeof src.note === "string" ? src.note : undefined,
		createdAt: normalizeString(src.createdAt, new Date().toISOString()),
	};
};

/** POST /appointments — public booking (no auth) */
export const createAppointmentApi = async (payload: AppointmentCreatePayload): Promise<Appointment | null> => {
	const { data } = await api.post<unknown>("/appointments", payload);
	return normalizeAppointment(data);
};

/** POST /appointments/client — booking by authenticated client */
export const createClientAppointmentApi = async (payload: AppointmentCreatePayload): Promise<Appointment | null> => {
	const { data } = await api.post<unknown>("/appointments/client", payload);
	return normalizeAppointment(data);
};

/** GET /appointments — staff: all appointments */
export const getAppointmentsApi = async (params: { from?: string; to?: string; staffId?: number; status?: string } = {}): Promise<Appointment[]> => {
	const { data } = await api.get<unknown>("/appointments", { params });
	return normalizeArray(extractList(data), normalizeAppointment);
};

/** GET /appointments/my — client: own appointments */
export const getMyAppointmentsApi = async (): Promise<Appointment[]> => {
	const { data } = await api.get<unknown>("/appointments/my");
	return normalizeArray(extractList(data), normalizeAppointment);
};

/** GET /appointments/:id */
export const getAppointmentApi = async (id: number): Promise<Appointment> => {
	const { data } = await api.get<unknown>(`/appointments/${id}`);
	const appointment = normalizeAppointment(data);
	if (!appointment) throw new Error("Invalid appointment response");
	return appointment;
};

/** PATCH /appointments/:id/reschedule */
export const rescheduleAppointmentApi = async (id: number, payload: AppointmentReschedulePayload): Promise<Appointment | null> => {
	const { data } = await api.patch<unknown>(`/appointments/${id}/reschedule`, payload);
	return normalizeAppointment(data);
};

/** PATCH /appointments/:id/cancel */
export const cancelAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const { data } = await api.patch<unknown>(`/appointments/${id}/cancel`);
	return normalizeAppointment(data);
};

/** PATCH /appointments/:id/confirm — ADMIN/RECEPTION */
export const confirmAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const { data } = await api.patch<unknown>(`/appointments/${id}/confirm`);
	return normalizeAppointment(data);
};

/** PATCH /appointments/:id/check-in — ADMIN/RECEPTION */
export const checkInAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const { data } = await api.patch<unknown>(`/appointments/${id}/check-in`);
	return normalizeAppointment(data);
};

/** PATCH /appointments/:id/start-service — Staff */
export const startServiceApi = async (id: number): Promise<Appointment | null> => {
	const { data } = await api.patch<unknown>(`/appointments/${id}/start-service`);
	return normalizeAppointment(data);
};

/** PATCH /appointments/:id/end-service — Staff */
export const endServiceApi = async (id: number): Promise<Appointment | null> => {
	const { data } = await api.patch<unknown>(`/appointments/${id}/end-service`);
	return normalizeAppointment(data);
};

/** PATCH /appointments/:id/no-show — ADMIN/RECEPTION */
export const noShowAppointmentApi = async (id: number): Promise<Appointment | null> => {
	const { data } = await api.patch<unknown>(`/appointments/${id}/no-show`);
	return normalizeAppointment(data);
};

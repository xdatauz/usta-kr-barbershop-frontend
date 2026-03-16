import { apiRequest } from "./client";

export type StaffRole = "ADMIN" | "BARBER" | "RECEPTION" | "HEAD_BARBER";

export interface StaffMember {
	id: number;
	name: string;
	email: string;
	phone?: string;
	role: StaffRole;
	branchId?: number;
	isActive: boolean;
}

export interface StaffCreatePayload {
	name: string;
	email: string;
	password: string;
	phone?: string;
	role: StaffRole;
	branchId?: number;
}

export interface StaffSchedule {
	id: number;
	staffId: number;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isWorking: boolean;
}

export interface ScheduleCreatePayload {
	staffId: number;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isWorking?: boolean;
}

const toNum = (v: unknown, fallback = 0): number =>
	typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : fallback;

const validRoles: StaffRole[] = ["ADMIN", "BARBER", "RECEPTION", "HEAD_BARBER"];

const normalizeStaff = (raw: unknown): StaffMember | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: typeof src.name === "string" ? src.name : "",
		email: typeof src.email === "string" ? src.email : "",
		phone: typeof src.phone === "string" ? src.phone : undefined,
		role: validRoles.includes(src.role as StaffRole) ? (src.role as StaffRole) : "RECEPTION",
		branchId: typeof src.branchId === "number" ? src.branchId : undefined,
		isActive: src.isActive !== false,
	};
};

const normalizeSchedule = (raw: unknown): StaffSchedule | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		staffId: toNum(src.staffId),
		dayOfWeek: toNum(src.dayOfWeek),
		startTime: typeof src.startTime === "string" ? src.startTime : "09:00",
		endTime: typeof src.endTime === "string" ? src.endTime : "18:00",
		isWorking: src.isWorking !== false,
	};
};

const extractList = (response: unknown): unknown[] => {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== "object") return [];
	const src = response as Record<string, unknown>;
	return Array.isArray(src.items) ? src.items : [];
};

export const getStaffApi = async (): Promise<StaffMember[]> => {
	const response = await apiRequest<unknown>("/staff", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeStaff)
		.filter((s): s is StaffMember => s !== null);
};

export const getStaffMemberApi = async (id: number): Promise<StaffMember> => {
	const response = await apiRequest<unknown>(`/staff/${id}`, { method: "GET", auth: true });
	const member = normalizeStaff(response);
	if (!member) throw new Error("Invalid staff response");
	return member;
};

export const createStaffApi = async (payload: StaffCreatePayload): Promise<StaffMember> => {
	const response = await apiRequest<unknown>("/staff", { method: "POST", auth: true, body: payload });
	const member = normalizeStaff(response);
	if (!member) throw new Error("Invalid staff response");
	return member;
};

export const updateStaffApi = async (id: number, payload: Partial<Omit<StaffCreatePayload, "password">>): Promise<StaffMember> => {
	const response = await apiRequest<unknown>(`/staff/${id}`, { method: "PATCH", auth: true, body: payload });
	const member = normalizeStaff(response);
	if (!member) throw new Error("Invalid staff response");
	return member;
};

export const deleteStaffApi = async (id: number): Promise<void> => {
	await apiRequest(`/staff/${id}`, { method: "DELETE", auth: true });
};

/** GET /staff/me/schedule — own schedule (for barber/staff) */
export const getMyScheduleApi = async (): Promise<StaffSchedule[]> => {
	const response = await apiRequest<unknown>("/staff/me/schedule", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeSchedule)
		.filter((s): s is StaffSchedule => s !== null);
};

export const getSchedulesApi = async (): Promise<StaffSchedule[]> => {
	const response = await apiRequest<unknown>("/staff/schedules", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeSchedule)
		.filter((s): s is StaffSchedule => s !== null);
};

export const createScheduleApi = async (payload: ScheduleCreatePayload): Promise<StaffSchedule> => {
	const response = await apiRequest<unknown>("/staff/schedules", { method: "POST", auth: true, body: payload });
	const schedule = normalizeSchedule(response);
	if (!schedule) throw new Error("Invalid schedule response");
	return schedule;
};

export const updateScheduleApi = async (id: number, payload: Partial<ScheduleCreatePayload>): Promise<StaffSchedule> => {
	const response = await apiRequest<unknown>(`/staff/schedules/${id}`, { method: "PATCH", auth: true, body: payload });
	const schedule = normalizeSchedule(response);
	if (!schedule) throw new Error("Invalid schedule response");
	return schedule;
};

export const deleteScheduleApi = async (id: number): Promise<void> => {
	await apiRequest(`/staff/schedules/${id}`, { method: "DELETE", auth: true });
};

import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray, extractList } from "./normalizers";

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

const validRoles: StaffRole[] = ["ADMIN", "BARBER", "RECEPTION", "HEAD_BARBER"];

const normalizeStaff = (raw: unknown): StaffMember | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: normalizeString(src.name),
		email: normalizeString(src.email),
		phone: typeof src.phone === "string" ? src.phone : undefined,
		role: validRoles.includes(src.role as StaffRole) ? (src.role as StaffRole) : "RECEPTION",
		branchId: typeof src.branchId === "number" ? src.branchId : undefined,
		isActive: src.isActive !== false,
	};
};

const normalizeSchedule = (raw: unknown): StaffSchedule | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		staffId: normalizeNumber(src.staffId),
		dayOfWeek: normalizeNumber(src.dayOfWeek),
		startTime: normalizeString(src.startTime, "09:00"),
		endTime: normalizeString(src.endTime, "18:00"),
		isWorking: src.isWorking !== false,
	};
};

export const getStaffApi = async (): Promise<StaffMember[]> => {
	const { data } = await api.get<unknown>("/staff");
	return normalizeArray(extractList(data), normalizeStaff);
};

export const getStaffMemberApi = async (id: number): Promise<StaffMember> => {
	const { data } = await api.get<unknown>(`/staff/${id}`);
	const member = normalizeStaff(data);
	if (!member) throw new Error("Invalid staff response");
	return member;
};

export const createStaffApi = async (payload: StaffCreatePayload): Promise<StaffMember> => {
	const { data } = await api.post<unknown>("/staff", payload);
	const member = normalizeStaff(data);
	if (!member) throw new Error("Invalid staff response");
	return member;
};

export const updateStaffApi = async (id: number, payload: Partial<Omit<StaffCreatePayload, "password">>): Promise<StaffMember> => {
	const { data } = await api.patch<unknown>(`/staff/${id}`, payload);
	const member = normalizeStaff(data);
	if (!member) throw new Error("Invalid staff response");
	return member;
};

export const deleteStaffApi = async (id: number): Promise<void> => {
	await api.delete(`/staff/${id}`);
};

/** GET /staff/me/schedule — own schedule (for barber/staff) */
export const getMyScheduleApi = async (): Promise<StaffSchedule[]> => {
	const { data } = await api.get<unknown>("/staff/me/schedule");
	return normalizeArray(extractList(data), normalizeSchedule);
};

export const getSchedulesApi = async (): Promise<StaffSchedule[]> => {
	const { data } = await api.get<unknown>("/staff/schedules");
	return normalizeArray(extractList(data), normalizeSchedule);
};

export const createScheduleApi = async (payload: ScheduleCreatePayload): Promise<StaffSchedule> => {
	const { data } = await api.post<unknown>("/staff/schedules", payload);
	const schedule = normalizeSchedule(data);
	if (!schedule) throw new Error("Invalid schedule response");
	return schedule;
};

export const updateScheduleApi = async (id: number, payload: Partial<ScheduleCreatePayload>): Promise<StaffSchedule> => {
	const { data } = await api.patch<unknown>(`/staff/schedules/${id}`, payload);
	const schedule = normalizeSchedule(data);
	if (!schedule) throw new Error("Invalid schedule response");
	return schedule;
};

export const deleteScheduleApi = async (id: number): Promise<void> => {
	await api.delete(`/staff/schedules/${id}`);
};

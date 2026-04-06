import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray, extractList } from "./normalizers";

export interface WorkTime {
	id: number;
	name: string;
	startTime: string;
	endTime: string;
	slotDurationMinutes: number;
	isDefault: boolean;
}

export interface WorkTimeCreatePayload {
	name: string;
	startTime: string;
	endTime: string;
	slotDurationMinutes?: number;
}

const normalizeWorkTime = (raw: unknown): WorkTime | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = normalizeNumber(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: normalizeString(src.name),
		startTime: normalizeString(src.startTime, "09:00"),
		endTime: normalizeString(src.endTime, "18:00"),
		slotDurationMinutes: normalizeNumber(src.slotDurationMinutes, 30),
		isDefault: src.isDefault === true,
	};
};

export const getTimesApi = async (): Promise<WorkTime[]> => {
	const { data } = await api.get<unknown>("/times");
	return normalizeArray(extractList(data), normalizeWorkTime);
};

export const getTimeApi = async (id: number): Promise<WorkTime> => {
	const { data } = await api.get<unknown>(`/times/${id}`);
	const time = normalizeWorkTime(data);
	if (!time) throw new Error("Invalid work time response");
	return time;
};

export const createTimeApi = async (payload: WorkTimeCreatePayload): Promise<WorkTime> => {
	const { data } = await api.post<unknown>("/times", payload);
	const time = normalizeWorkTime(data);
	if (!time) throw new Error("Invalid work time response");
	return time;
};

export const updateTimeApi = async (id: number, payload: Partial<WorkTimeCreatePayload>): Promise<WorkTime> => {
	const { data } = await api.patch<unknown>(`/times/${id}`, payload);
	const time = normalizeWorkTime(data);
	if (!time) throw new Error("Invalid work time response");
	return time;
};

export const deleteTimeApi = async (id: number): Promise<void> => {
	await api.delete(`/times/${id}`);
};

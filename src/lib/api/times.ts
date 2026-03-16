import { apiRequest } from "./client";

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

const toNum = (v: unknown, fallback = 0): number =>
	typeof v === "number" ? v : Number.isFinite(Number(v)) ? Number(v) : fallback;

const normalizeWorkTime = (raw: unknown): WorkTime | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = toNum(src.id, -1);
	if (id < 0) return null;

	return {
		id,
		name: typeof src.name === "string" ? src.name : "",
		startTime: typeof src.startTime === "string" ? src.startTime : "09:00",
		endTime: typeof src.endTime === "string" ? src.endTime : "18:00",
		slotDurationMinutes: toNum(src.slotDurationMinutes, 30),
		isDefault: src.isDefault === true,
	};
};

const extractList = (response: unknown): unknown[] => {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== "object") return [];
	const src = response as Record<string, unknown>;
	return Array.isArray(src.items) ? src.items : [];
};

export const getTimesApi = async (): Promise<WorkTime[]> => {
	const response = await apiRequest<unknown>("/times", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeWorkTime)
		.filter((t): t is WorkTime => t !== null);
};

export const getTimeApi = async (id: number): Promise<WorkTime> => {
	const response = await apiRequest<unknown>(`/times/${id}`, { method: "GET", auth: true });
	const time = normalizeWorkTime(response);
	if (!time) throw new Error("Invalid work time response");
	return time;
};

export const createTimeApi = async (payload: WorkTimeCreatePayload): Promise<WorkTime> => {
	const response = await apiRequest<unknown>("/times", { method: "POST", auth: true, body: payload });
	const time = normalizeWorkTime(response);
	if (!time) throw new Error("Invalid work time response");
	return time;
};

export const updateTimeApi = async (id: number, payload: Partial<WorkTimeCreatePayload>): Promise<WorkTime> => {
	const response = await apiRequest<unknown>(`/times/${id}`, { method: "PATCH", auth: true, body: payload });
	const time = normalizeWorkTime(response);
	if (!time) throw new Error("Invalid work time response");
	return time;
};

export const deleteTimeApi = async (id: number): Promise<void> => {
	await apiRequest(`/times/${id}`, { method: "DELETE", auth: true });
};

import api from "./client";
import { normalizeString, normalizeNumber } from "./normalizers";

export interface HealthStatus {
	status: "ok" | "error";
	timestamp?: string;
	uptime?: number;
}

export const getHealthApi = async (): Promise<HealthStatus> => {
	const { data } = await api.get<unknown>("/health");
	if (!data || typeof data !== "object") return { status: "ok" };
	const src = data as Record<string, unknown>;
	return {
		status: normalizeString(src.status) === "error" ? "error" : "ok",
		timestamp: typeof src.timestamp === "string" ? src.timestamp : undefined,
		uptime: typeof src.uptime === "number" ? normalizeNumber(src.uptime) : undefined,
	};
};

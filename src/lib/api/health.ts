import { apiRequest } from "./client";

export interface HealthStatus {
	status: "ok" | "error";
	timestamp?: string;
	uptime?: number;
}

export const getHealthApi = async (): Promise<HealthStatus> => {
	const response = await apiRequest<unknown>("/health", { method: "GET" });
	if (!response || typeof response !== "object") return { status: "ok" };
	const src = response as Record<string, unknown>;
	return {
		status: src.status === "error" ? "error" : "ok",
		timestamp: typeof src.timestamp === "string" ? src.timestamp : undefined,
		uptime: typeof src.uptime === "number" ? src.uptime : undefined,
	};
};

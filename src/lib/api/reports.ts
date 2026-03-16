import { apiRequest } from "./client";

export interface RevenueReport {
	total: number;
	cash: number;
	card: number;
	transfer: number;
	other: number;
	period: string;
}

export interface TopService {
	serviceId: number;
	serviceName: string;
	count: number;
	revenue: number;
}

export interface BarberStats {
	barberId: number;
	barberName: string;
	appointments: number;
	revenue: number;
	avgRating?: number;
}

export interface ChannelStats {
	channel: string;
	count: number;
	percent: number;
}

export interface CancelNoShowStats {
	cancelled: number;
	noShow: number;
	total: number;
	cancelRate: number;
	noShowRate: number;
}

export interface MonthlyOverview {
	month: string;
	appointments: number;
	revenue: number;
	newClients: number;
}

const buildDateQuery = (params: { from?: string; to?: string }): string => {
	const q = new URLSearchParams();
	if (params.from) q.set("from", params.from);
	if (params.to) q.set("to", params.to);
	return q.toString();
};

/** GET /reports/revenue */
export const getRevenueReportApi = async (params: { from?: string; to?: string } = {}): Promise<RevenueReport> => {
	const qs = buildDateQuery(params);
	return apiRequest<RevenueReport>(`/reports/revenue${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
};

/** GET /reports/services-top */
export const getTopServicesApi = async (params: { from?: string; to?: string; limit?: number } = {}): Promise<TopService[]> => {
	const q = new URLSearchParams();
	if (params.from) q.set("from", params.from);
	if (params.to) q.set("to", params.to);
	if (params.limit !== undefined) q.set("limit", String(params.limit));
	const qs = q.toString();

	const response = await apiRequest<unknown>(`/reports/services-top${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
	return Array.isArray(response) ? (response as TopService[]) : [];
};

/** GET /reports/barbers */
export const getBarberStatsReportApi = async (params: { from?: string; to?: string } = {}): Promise<BarberStats[]> => {
	const qs = buildDateQuery(params);
	const response = await apiRequest<unknown>(`/reports/barbers${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
	return Array.isArray(response) ? (response as BarberStats[]) : [];
};

/** GET /reports/channels */
export const getChannelStatsApi = async (params: { from?: string; to?: string } = {}): Promise<ChannelStats[]> => {
	const qs = buildDateQuery(params);
	const response = await apiRequest<unknown>(`/reports/channels${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
	return Array.isArray(response) ? (response as ChannelStats[]) : [];
};

/** GET /reports/cancel-no-show */
export const getCancelNoShowStatsApi = async (params: { from?: string; to?: string } = {}): Promise<CancelNoShowStats> => {
	const qs = buildDateQuery(params);
	return apiRequest<CancelNoShowStats>(`/reports/cancel-no-show${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
};

/** GET /reports/overview */
export const getMonthlyOverviewApi = async (params: { year?: number } = {}): Promise<MonthlyOverview[]> => {
	const q = new URLSearchParams();
	if (params.year !== undefined) q.set("year", String(params.year));
	const qs = q.toString();

	const response = await apiRequest<unknown>(`/reports/overview${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
	return Array.isArray(response) ? (response as MonthlyOverview[]) : [];
};

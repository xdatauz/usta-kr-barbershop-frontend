import api from "./client";

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

/** GET /reports/revenue */
export const getRevenueReportApi = async (params: { from?: string; to?: string } = {}): Promise<RevenueReport> => {
	const { data } = await api.get<RevenueReport>("/reports/revenue", { params });
	return data;
};

/** GET /reports/services-top */
export const getTopServicesApi = async (params: { from?: string; to?: string; limit?: number } = {}): Promise<TopService[]> => {
	const { data } = await api.get<unknown>("/reports/services-top", { params });
	return Array.isArray(data) ? (data as TopService[]) : [];
};

/** GET /reports/barbers */
export const getBarberStatsReportApi = async (params: { from?: string; to?: string } = {}): Promise<BarberStats[]> => {
	const { data } = await api.get<unknown>("/reports/barbers", { params });
	return Array.isArray(data) ? (data as BarberStats[]) : [];
};

/** GET /reports/channels */
export const getChannelStatsApi = async (params: { from?: string; to?: string } = {}): Promise<ChannelStats[]> => {
	const { data } = await api.get<unknown>("/reports/channels", { params });
	return Array.isArray(data) ? (data as ChannelStats[]) : [];
};

/** GET /reports/cancel-no-show */
export const getCancelNoShowStatsApi = async (params: { from?: string; to?: string } = {}): Promise<CancelNoShowStats> => {
	const { data } = await api.get<CancelNoShowStats>("/reports/cancel-no-show", { params });
	return data;
};

/** GET /reports/overview */
export const getMonthlyOverviewApi = async (params: { year?: number } = {}): Promise<MonthlyOverview[]> => {
	const { data } = await api.get<unknown>("/reports/overview", { params });
	return Array.isArray(data) ? (data as MonthlyOverview[]) : [];
};

import { apiRequest } from "./client";

export interface Branch {
	id: number;
	name: string;
	address?: string;
	phone?: string;
	isActive: boolean;
}

export interface BranchCreatePayload {
	name: string;
	address?: string;
	phone?: string;
}

const normalizeBranch = (raw: unknown): Branch | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = typeof src.id === "number" ? src.id : parseInt(String(src.id ?? 0));
	if (!id || isNaN(id)) return null;

	return {
		id,
		name: typeof src.name === "string" ? src.name : "",
		address: typeof src.address === "string" ? src.address : undefined,
		phone: typeof src.phone === "string" ? src.phone : undefined,
		isActive: src.isActive !== false,
	};
};

const extractList = (response: unknown): unknown[] => {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== "object") return [];
	const src = response as Record<string, unknown>;
	return Array.isArray(src.items) ? src.items : [];
};

export const getBranchesApi = async (): Promise<Branch[]> => {
	const response = await apiRequest<unknown>("/branches", { method: "GET", auth: true });
	return extractList(response)
		.map(normalizeBranch)
		.filter((b): b is Branch => b !== null);
};

export const getBranchApi = async (id: number): Promise<Branch> => {
	const response = await apiRequest<unknown>(`/branches/${id}`, { method: "GET", auth: true });
	const branch = normalizeBranch(response);
	if (!branch) throw new Error("Invalid branch response");
	return branch;
};

export const createBranchApi = async (payload: BranchCreatePayload): Promise<Branch> => {
	const response = await apiRequest<unknown>("/branches", { method: "POST", auth: true, body: payload });
	const branch = normalizeBranch(response);
	if (!branch) throw new Error("Invalid branch response");
	return branch;
};

export const updateBranchApi = async (id: number, payload: Partial<BranchCreatePayload>): Promise<Branch> => {
	const response = await apiRequest<unknown>(`/branches/${id}`, { method: "PATCH", auth: true, body: payload });
	const branch = normalizeBranch(response);
	if (!branch) throw new Error("Invalid branch response");
	return branch;
};

export const deleteBranchApi = async (id: number): Promise<void> => {
	await apiRequest(`/branches/${id}`, { method: "DELETE", auth: true });
};

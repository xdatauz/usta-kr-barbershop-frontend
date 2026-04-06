import api from "./client";
import { normalizeNumber, normalizeString, normalizeArray, extractList } from "./normalizers";

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

	const id = normalizeNumber(src.id, -1);
	if (!id || isNaN(id) || id < 0) return null;

	return {
		id,
		name: normalizeString(src.name),
		address: typeof src.address === "string" ? src.address : undefined,
		phone: typeof src.phone === "string" ? src.phone : undefined,
		isActive: src.isActive !== false,
	};
};

export const getBranchesApi = async (): Promise<Branch[]> => {
	const { data } = await api.get<unknown>("/branches");
	return normalizeArray(extractList(data), normalizeBranch);
};

export const getBranchApi = async (id: number): Promise<Branch> => {
	const { data } = await api.get<unknown>(`/branches/${id}`);
	const branch = normalizeBranch(data);
	if (!branch) throw new Error("Invalid branch response");
	return branch;
};

export const createBranchApi = async (payload: BranchCreatePayload): Promise<Branch> => {
	const { data } = await api.post<unknown>("/branches", payload);
	const branch = normalizeBranch(data);
	if (!branch) throw new Error("Invalid branch response");
	return branch;
};

export const updateBranchApi = async (id: number, payload: Partial<BranchCreatePayload>): Promise<Branch> => {
	const { data } = await api.patch<unknown>(`/branches/${id}`, payload);
	const branch = normalizeBranch(data);
	if (!branch) throw new Error("Invalid branch response");
	return branch;
};

export const deleteBranchApi = async (id: number): Promise<void> => {
	await api.delete(`/branches/${id}`);
};

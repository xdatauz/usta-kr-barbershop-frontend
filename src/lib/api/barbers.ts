import api from "./client";
import { normalizeId, normalizeString, normalizeNumber, normalizeBoolean, normalizeArray, extractList } from "./normalizers";

export interface BarberStats {
	likes: number;
	dislikes: number;
	followers: number;
	reports?: number;
}

export interface BarberViewer {
	isFollowing: boolean;
	liked: boolean;
	disliked: boolean;
}

export interface BarberProfile {
	id: string;
	name: string;
	role: string;
	bio: string;
	image: string;
	stats: BarberStats;
	viewer?: BarberViewer;
}

export interface BarberComment {
	id: string;
	author: string;
	text: string;
	createdAt: string;
}

export interface CommentListResponse {
	items: BarberComment[];
	total: number;
}

const normalizeStats = (raw: unknown): BarberStats => {
	if (!raw || typeof raw !== "object") {
		return { likes: 0, dislikes: 0, followers: 0, reports: 0 };
	}
	const source = raw as Partial<BarberStats>;
	return {
		likes: normalizeNumber(source.likes),
		dislikes: normalizeNumber(source.dislikes),
		followers: normalizeNumber(source.followers),
		reports: normalizeNumber(source.reports),
	};
};

const normalizeViewer = (raw: unknown): BarberViewer => {
	if (!raw || typeof raw !== "object") {
		return { isFollowing: false, liked: false, disliked: false };
	}
	const source = raw as Partial<BarberViewer>;
	return {
		isFollowing: normalizeBoolean(source.isFollowing),
		liked: normalizeBoolean(source.liked),
		disliked: normalizeBoolean(source.disliked),
	};
};

const normalizeBarberProfile = (raw: unknown): BarberProfile | null => {
	if (!raw || typeof raw !== "object") return null;

	const source = raw as {
		id?: unknown;
		name?: unknown;
		fullName?: unknown;
		role?: unknown;
		displayRole?: unknown;
		bio?: unknown;
		image?: unknown;
		stats?: unknown;
		likes?: unknown;
		dislikes?: unknown;
		followersCount?: unknown;
		viewer?: unknown;
	};

	const id = normalizeId(source.id);
	if (!id) return null;

	const name = typeof source.name === "string" ? source.name
		: typeof source.fullName === "string" ? source.fullName
		: id;

	// Backend may return flat stats (likes, dislikes, followersCount) instead of nested stats object
	const flatStats: Partial<BarberStats> = {};
	if (typeof source.likes === "number") flatStats.likes = source.likes;
	if (typeof source.dislikes === "number") flatStats.dislikes = source.dislikes;
	if (typeof source.followersCount === "number") flatStats.followers = source.followersCount;

	return {
		id,
		name,
		role: typeof source.role === "string" ? source.role
			: typeof source.displayRole === "string" ? source.displayRole
			: "",
		bio: normalizeString(source.bio),
		image: normalizeString(source.image),
		stats: normalizeStats(Object.keys(flatStats).length > 0 ? { ...flatStats, ...(typeof source.stats === "object" && source.stats !== null ? source.stats as object : {}) } : source.stats),
		viewer: normalizeViewer(source.viewer),
	};
};

const normalizeComment = (raw: unknown): BarberComment | null => {
	if (!raw || typeof raw !== "object") return null;

	const source = raw as Partial<BarberComment>;
	if (typeof source.id !== "string" || typeof source.text !== "string") return null;

	return {
		id: source.id,
		author: typeof source.author === "string" && source.author.trim() ? source.author : "Guest",
		text: source.text,
		createdAt: normalizeString(source.createdAt, new Date().toISOString()),
	};
};

export const getBarbersApi = async (): Promise<BarberProfile[]> => {
	const { data } = await api.get<unknown>("/barbers");
	// Handle both { data: [...] } wrapper and plain array
	const list = extractList(data);
	return normalizeArray(list, normalizeBarberProfile);
};

export const getBarberApi = async (id: string): Promise<BarberProfile> => {
	const { data } = await api.get<unknown>(`/barbers/${id}`);
	// Handle both { data: {...} } wrapper and plain object
	const raw = data && typeof data === "object" && "data" in (data as Record<string, unknown>)
		? (data as Record<string, unknown>).data
		: data;
	const profile = normalizeBarberProfile(raw);
	if (!profile) throw new Error("Invalid barber response");
	return profile;
};

export const getBarberCommentsApi = async (id: string): Promise<CommentListResponse> => {
	const { data } = await api.get<unknown>(`/barbers/${id}/comments`, {
		params: { page: 1, pageSize: 30 },
	});

	const list = extractList(data);

	const metaTotal =
		data && typeof data === "object" && "meta" in (data as object)
			? normalizeNumber(((data as { meta?: { total?: unknown } }).meta?.total ?? list.length), list.length)
			: list.length;

	return {
		items: normalizeArray(list, normalizeComment),
		total: metaTotal,
	};
};

// Unwrap potential { data: {...} } wrapper from old backend
const unwrap = (d: unknown): Record<string, unknown> => {
	if (!d || typeof d !== "object") return {};
	const obj = d as Record<string, unknown>;
	if ("data" in obj && obj.data && typeof obj.data === "object" && !("liked" in obj) && !("id" in obj))
		return obj.data as Record<string, unknown>;
	return obj;
};

export const postBarberCommentApi = async (id: string, payload: { text: string; author?: string }): Promise<BarberComment | null> => {
	const body: Record<string, string> = { text: payload.text };
	if (payload.author) body.author = payload.author;

	const { data } = await api.post<unknown>(`/barbers/${id}/comments`, body);
	const raw = unwrap(data);
	return normalizeComment(raw);
};

export interface ReactionResult {
	stats: BarberStats;
	liked: boolean;
	disliked: boolean;
}

export const likeBarberApi = async (id: string): Promise<ReactionResult | null> => {
	const { data } = await api.post<unknown>(`/barbers/${id}/like`);
	const source = unwrap(data);
	return {
		stats: normalizeStats(source),
		liked: normalizeBoolean(source.liked),
		disliked: normalizeBoolean(source.disliked),
	};
};

export const dislikeBarberApi = async (id: string): Promise<ReactionResult | null> => {
	const { data } = await api.post<unknown>(`/barbers/${id}/dislike`);
	const source = unwrap(data);
	return {
		stats: normalizeStats(source),
		liked: normalizeBoolean(source.liked),
		disliked: normalizeBoolean(source.disliked),
	};
};

export const followBarberApi = async (id: string): Promise<{ isFollowing: boolean; followers: number }> => {
	const { data } = await api.post<unknown>(`/barbers/${id}/follow`);
	const source = unwrap(data);
	return {
		isFollowing: normalizeBoolean(source.isFollowing),
		followers: normalizeNumber(source.followers),
	};
};

export const unfollowBarberApi = async (id: string): Promise<{ isFollowing: boolean; followers: number }> => {
	const { data } = await api.delete<unknown>(`/barbers/${id}/follow`);
	const source = unwrap(data);
	return {
		isFollowing: normalizeBoolean(source.isFollowing),
		followers: normalizeNumber(source.followers),
	};
};

export const reportBarberApi = async (id: string, payload: { reason: string; details?: string }) => {
	await api.post(`/barbers/${id}/report`, payload);
};

import { apiRequest } from "./client";

export interface BarberStats {
	likes: number;
	dislikes: number;
	followers: number;
	reports?: number;
}

export interface BarberViewer {
	isFollowing: boolean;
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

const toNumber = (value: unknown, fallback = 0) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

const normalizeStats = (raw: unknown): BarberStats => {
	if (!raw || typeof raw !== "object") {
		return {
			likes: 0,
			dislikes: 0,
			followers: 0,
			reports: 0,
		};
	}

	const source = raw as Partial<BarberStats>;
	return {
		likes: toNumber(source.likes),
		dislikes: toNumber(source.dislikes),
		followers: toNumber(source.followers),
		reports: toNumber(source.reports),
	};
};

const normalizeViewer = (raw: unknown): BarberViewer => {
	if (!raw || typeof raw !== "object") {
		return { isFollowing: false };
	}

	const source = raw as Partial<BarberViewer>;
	return {
		isFollowing: Boolean(source.isFollowing),
	};
};

const normalizeBarberProfile = (raw: unknown): BarberProfile | null => {
	if (!raw || typeof raw !== "object") {
		return null;
	}

	const source = raw as {
		id?: unknown;
		name?: unknown;
		role?: unknown;
		bio?: unknown;
		image?: unknown;
		stats?: unknown;
		viewer?: unknown;
	};

	if (typeof source.id !== "string") {
		return null;
	}

	return {
		id: source.id,
		name: typeof source.name === "string" ? source.name : source.id,
		role: typeof source.role === "string" ? source.role : "",
		bio: typeof source.bio === "string" ? source.bio : "",
		image: typeof source.image === "string" ? source.image : "",
		stats: normalizeStats(source.stats),
		viewer: normalizeViewer(source.viewer),
	};
};

const normalizeComment = (raw: unknown): BarberComment | null => {
	if (!raw || typeof raw !== "object") {
		return null;
	}

	const source = raw as Partial<BarberComment>;
	if (typeof source.id !== "string" || typeof source.text !== "string") {
		return null;
	}

	return {
		id: source.id,
		author: typeof source.author === "string" && source.author.trim() ? source.author : "Guest",
		text: source.text,
		createdAt: typeof source.createdAt === "string" ? source.createdAt : new Date().toISOString(),
	};
};

export const getBarbersApi = async (): Promise<BarberProfile[]> => {
	const response = await apiRequest<unknown>("/barbers", { method: "GET" });
	const list = Array.isArray(response)
		? response
		: response && typeof response === "object" && Array.isArray((response as { items?: unknown[] }).items)
			? ((response as { items: unknown[] }).items ?? [])
			: [];

	return list.map((item) => normalizeBarberProfile(item)).filter((item): item is BarberProfile => item !== null);
};

export const getBarberApi = async (id: string): Promise<BarberProfile> => {
	const response = await apiRequest<unknown>(`/barbers/${id}`, { method: "GET" });
	const profile = normalizeBarberProfile(response);

	if (!profile) {
		throw new Error("Invalid barber response");
	}

	return profile;
};

export const getBarberCommentsApi = async (id: string): Promise<CommentListResponse> => {
	const response = await apiRequest<unknown>(`/barbers/${id}/comments?page=1&pageSize=30`, { method: "GET" });

	const list = Array.isArray(response)
		? response
		: response && typeof response === "object" && Array.isArray((response as { items?: unknown[] }).items)
			? ((response as { items: unknown[] }).items ?? [])
			: [];

	const metaTotal =
		response && typeof response === "object" && response && "meta" in (response as object)
			? toNumber(((response as { meta?: { total?: unknown } }).meta?.total ?? list.length), list.length)
			: list.length;

	return {
		items: list.map((item) => normalizeComment(item)).filter((item): item is BarberComment => item !== null),
		total: metaTotal,
	};
};

export const postBarberCommentApi = async (id: string, payload: { text: string; rating?: number }): Promise<BarberComment | null> => {
	const response = await apiRequest<unknown>(`/barbers/${id}/comments`, {
		method: "POST",
		auth: true,
		body: {
			comment: payload.text,
			rating: payload.rating ?? 5,
		},
	});
	return normalizeComment(response);
};

export const likeBarberApi = async (id: string): Promise<BarberStats | null> => {
	const response = await apiRequest<unknown>(`/barbers/${id}/like`, {
		method: "POST",
		auth: true,
	});
	if (!response || typeof response !== "object") {
		return null;
	}
	const source = response as { stats?: unknown };
	return normalizeStats(source.stats || response);
};

export const dislikeBarberApi = async (id: string): Promise<BarberStats | null> => {
	const response = await apiRequest<unknown>(`/barbers/${id}/dislike`, {
		method: "POST",
		auth: true,
	});
	if (!response || typeof response !== "object") {
		return null;
	}
	const source = response as { stats?: unknown };
	return normalizeStats(source.stats || response);
};

export const followBarberApi = async (id: string): Promise<BarberViewer & { followers?: number }> => {
	const response = await apiRequest<unknown>(`/barbers/${id}/follow`, {
		method: "POST",
		auth: true,
	});

	const source =
		response && typeof response === "object"
			? (response as {
					isFollowing?: unknown;
					followers?: unknown;
					viewer?: { isFollowing?: unknown };
					stats?: { followers?: unknown };
				})
			: {};
	return {
		isFollowing: Boolean(source.isFollowing ?? source.viewer?.isFollowing),
		followers: toNumber(source.followers ?? source.stats?.followers),
	};
};

export const unfollowBarberApi = async (id: string): Promise<BarberViewer & { followers?: number }> => {
	const response = await apiRequest<unknown>(`/barbers/${id}/follow`, {
		method: "DELETE",
		auth: true,
	});

	const source =
		response && typeof response === "object"
			? (response as {
					isFollowing?: unknown;
					followers?: unknown;
					viewer?: { isFollowing?: unknown };
					stats?: { followers?: unknown };
				})
			: {};
	return {
		isFollowing: Boolean(source.isFollowing ?? source.viewer?.isFollowing),
		followers: toNumber(source.followers ?? source.stats?.followers),
	};
};

export const reportBarberApi = async (id: string, payload: { reason: string; details?: string }) => {
	await apiRequest(`/barbers/${id}/report`, {
		method: "POST",
		auth: true,
		body: payload,
	});
};

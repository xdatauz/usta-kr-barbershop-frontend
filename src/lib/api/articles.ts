import { apiRequest } from "./client";

export interface ArticleItem {
	id: string;
	title: string;
	summary: string;
	content: string;
	authorId: string;
	authorName: string;
	authorRole: string;
	createdAt: string;
	updatedAt: string;
}

export interface ArticleCreatePayload {
	title: string;
	summary: string;
	content: string;
}

const normalizeArticle = (raw: unknown): ArticleItem | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;

	const id = typeof src.id === "string" ? src.id : typeof src.id === "number" ? String(src.id) : null;
	if (!id) return null;

	const author = src.author && typeof src.author === "object" ? (src.author as Record<string, unknown>) : null;

	return {
		id,
		title: typeof src.title === "string" ? src.title : "",
		summary: typeof src.summary === "string" ? src.summary : "",
		content: typeof src.content === "string" ? src.content : "",
		authorId: typeof src.authorId === "string" ? src.authorId : author ? String(author.id ?? "") : "",
		authorName: typeof src.authorName === "string" ? src.authorName : author ? String(author.name ?? "") : "",
		authorRole: typeof src.authorRole === "string" ? src.authorRole : author ? String(author.userType ?? author.role ?? "") : "",
		createdAt: typeof src.createdAt === "string" ? src.createdAt : new Date().toISOString(),
		updatedAt: typeof src.updatedAt === "string" ? src.updatedAt : new Date().toISOString(),
	};
};

const extractList = (response: unknown): unknown[] => {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== "object") return [];
	const src = response as Record<string, unknown>;
	if (Array.isArray(src.items)) return src.items;
	if (Array.isArray(src.data)) return src.data;
	if (src.data && typeof src.data === "object") {
		const data = src.data as Record<string, unknown>;
		if (Array.isArray(data.items)) return data.items;
	}
	return [];
};

export const getArticlesApi = async (params: { page?: number; pageSize?: number } = {}): Promise<ArticleItem[]> => {
	const { page = 1, pageSize = 20 } = params;
	const response = await apiRequest<unknown>(`/articles?page=${page}&pageSize=${pageSize}`, { method: "GET" });
	return extractList(response)
		.map(normalizeArticle)
		.filter((a): a is ArticleItem => a !== null);
};

export const getArticleApi = async (id: string): Promise<ArticleItem> => {
	const response = await apiRequest<unknown>(`/articles/${id}`, { method: "GET" });
	const article = normalizeArticle(response);
	if (!article) throw new Error("Invalid article response");
	return article;
};

export const createArticleApi = async (payload: ArticleCreatePayload): Promise<ArticleItem | null> => {
	const response = await apiRequest<unknown>("/articles", {
		method: "POST",
		auth: true,
		body: payload,
	});
	return normalizeArticle(response);
};

export const updateArticleApi = async (id: string, payload: Partial<ArticleCreatePayload>): Promise<ArticleItem | null> => {
	const response = await apiRequest<unknown>(`/articles/${id}`, {
		method: "PATCH",
		auth: true,
		body: payload,
	});
	return normalizeArticle(response);
};

export const deleteArticleApi = async (id: string): Promise<void> => {
	await apiRequest(`/articles/${id}`, { method: "DELETE", auth: true });
};

import api from "./client";
import { normalizeId, normalizeString, normalizeArray, extractList } from "./normalizers";

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

	const id = normalizeId(src.id);
	if (!id) return null;

	const author = src.author && typeof src.author === "object" ? (src.author as Record<string, unknown>) : null;

	return {
		id,
		title: normalizeString(src.title),
		summary: normalizeString(src.summary),
		content: normalizeString(src.content),
		authorId: typeof src.authorId === "string" ? src.authorId : author ? String(author.id ?? "") : "",
		authorName: typeof src.authorName === "string" ? src.authorName : author ? String(author.name ?? "") : "",
		authorRole: typeof src.authorRole === "string" ? src.authorRole : author ? String(author.userType ?? author.role ?? "") : "",
		createdAt: normalizeString(src.createdAt, new Date().toISOString()),
		updatedAt: normalizeString(src.updatedAt, new Date().toISOString()),
	};
};

export const getArticlesApi = async (params: { page?: number; pageSize?: number } = {}): Promise<ArticleItem[]> => {
	const { page = 1, pageSize = 20 } = params;
	const { data } = await api.get<unknown>("/articles", {
		params: { page, pageSize },
	});
	return normalizeArray(extractList(data), normalizeArticle);
};

export const getArticleApi = async (id: string): Promise<ArticleItem> => {
	const { data } = await api.get<unknown>(`/articles/${id}`);
	const article = normalizeArticle(data);
	if (!article) throw new Error("Invalid article response");
	return article;
};

export const createArticleApi = async (payload: ArticleCreatePayload): Promise<ArticleItem | null> => {
	const { data } = await api.post<unknown>("/articles", payload);
	return normalizeArticle(data);
};

export const updateArticleApi = async (id: string, payload: Partial<ArticleCreatePayload>): Promise<ArticleItem | null> => {
	const { data } = await api.patch<unknown>(`/articles/${id}`, payload);
	return normalizeArticle(data);
};

export const deleteArticleApi = async (id: string): Promise<void> => {
	await api.delete(`/articles/${id}`);
};

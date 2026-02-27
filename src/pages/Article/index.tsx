import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, PenSquare, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth, type UserType } from "../../context/auth/auth-provider";

interface ArticleItem {
	id: string;
	title: string;
	summary: string;
	content: string;
	authorId: string;
	authorName: string;
	authorRole: UserType;
	createdAt: string;
	updatedAt?: string;
}

interface ArticleFormState {
	title: string;
	summary: string;
	content: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const API_PREFIX = `${API_BASE_URL}/api/v1`;

const canWriteArticles = (role: UserType | undefined): role is "ADMIN" | "BARBER" => {
	return role === "ADMIN" || role === "BARBER";
};

const getAuthHeaders = (): Record<string, string> => {
	const token = localStorage.getItem("usta_access_token") || localStorage.getItem("access_token");
	if (!token) {
		return {};
	}

	return {
		Authorization: `Bearer ${token}`,
	};
};

const readJsonSafe = async (response: Response): Promise<unknown> => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

const resolveErrorMessage = (payload: unknown, fallback: string) => {
	if (!payload || typeof payload !== "object") {
		return fallback;
	}
	const source = payload as { error?: { message?: string }; message?: string };
	if (typeof source.error?.message === "string" && source.error.message.trim()) {
		return source.error.message;
	}
	if (typeof source.message === "string" && source.message.trim()) {
		return source.message;
	}
	return fallback;
};

const normalizeRole = (value: unknown): UserType => {
	if (value === "ADMIN" || value === "BARBER" || value === "USER") {
		return value;
	}
	return "USER";
};

const normalizeArticle = (raw: unknown): ArticleItem | null => {
	if (!raw || typeof raw !== "object") {
		return null;
	}

	const source = raw as {
		id?: unknown;
		title?: unknown;
		summary?: unknown;
		content?: unknown;
		authorId?: unknown;
		authorName?: unknown;
		authorRole?: unknown;
		author?: { id?: unknown; name?: unknown; userType?: unknown } | null;
		createdAt?: unknown;
		updatedAt?: unknown;
	};

	if (typeof source.id !== "string" || typeof source.title !== "string" || typeof source.summary !== "string" || typeof source.content !== "string") {
		return null;
	}

	const createdAt = typeof source.createdAt === "string" ? source.createdAt : new Date().toISOString();
	const authorName =
		typeof source.authorName === "string"
			? source.authorName
			: typeof source.author?.name === "string"
				? source.author.name
				: "";
	const authorId =
		typeof source.authorId === "string"
			? source.authorId
			: typeof source.author?.id === "string"
				? source.author.id
				: "unknown";
	const authorRole = normalizeRole(source.authorRole ?? source.author?.userType);
	const updatedAt = typeof source.updatedAt === "string" ? source.updatedAt : undefined;

	return {
		id: source.id,
		title: source.title,
		summary: source.summary,
		content: source.content,
		authorId,
		authorName,
		authorRole,
		createdAt,
		updatedAt,
	};
};

const extractArticles = (payload: unknown): ArticleItem[] => {
	if (!payload || typeof payload !== "object") {
		return [];
	}

	const source = payload as { data?: unknown; items?: unknown };
	const list = Array.isArray(source.data)
		? source.data
		: source.data && typeof source.data === "object" && Array.isArray((source.data as { items?: unknown }).items)
			? ((source.data as { items: unknown[] }).items ?? [])
			: Array.isArray(source.items)
				? source.items
				: [];

	return list
		.map((item) => normalizeArticle(item))
		.filter((item): item is ArticleItem => item !== null)
		.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
};

const ArticlePage = () => {
	const { t, i18n } = useTranslation();
	const { currentUser } = useAuth();
	const [articles, setArticles] = useState<ArticleItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState<ArticleFormState>({
		title: "",
		summary: "",
		content: "",
	});
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");

	const canPublish = canWriteArticles(currentUser?.userType);

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(i18n.resolvedLanguage || "en", {
				dateStyle: "medium",
				timeStyle: "short",
			}),
		[i18n.resolvedLanguage],
	);

	const fetchArticles = useCallback(async () => {
		setIsLoading(true);
		setLoadError("");

		try {
			const response = await fetch(`${API_PREFIX}/articles?page=1&pageSize=20`, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
				credentials: "include",
			});
			const payload = await readJsonSafe(response);

			if (!response.ok) {
				throw new Error(resolveErrorMessage(payload, t("articlePage.loadError")));
			}

			setArticles(extractArticles(payload));
		} catch (error) {
			const message = error instanceof Error && error.message ? error.message : t("articlePage.loadError");
			setLoadError(message);
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}, [t]);

	useEffect(() => {
		void fetchArticles();
	}, [fetchArticles]);

	const createArticle = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!canPublish || !currentUser) {
			return;
		}

		const authorRole = currentUser.userType;
		if (authorRole !== "ADMIN" && authorRole !== "BARBER") {
			return;
		}

		const nextTitle = form.title.trim();
		const nextSummary = form.summary.trim();
		const nextContent = form.content.trim();

		if (!nextTitle || !nextSummary || !nextContent) {
			setFormError(t("articlePage.form.validation"));
			setFormSuccess("");
			return;
		}

		setIsSubmitting(true);
		setFormError("");
		setFormSuccess("");

		void (async () => {
			try {
				const response = await fetch(`${API_PREFIX}/articles`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						...getAuthHeaders(),
					},
					credentials: "include",
					body: JSON.stringify({
						title: nextTitle,
						summary: nextSummary,
						content: nextContent,
					}),
				});
				const payload = await readJsonSafe(response);

				if (!response.ok) {
					throw new Error(resolveErrorMessage(payload, t("articlePage.form.error")));
				}

				const createdArticle = normalizeArticle(
					payload && typeof payload === "object" ? (payload as { data?: unknown }).data : null,
				);

				if (createdArticle) {
					setArticles((prev) => [createdArticle, ...prev]);
				} else {
					await fetchArticles();
				}

				setForm({
					title: "",
					summary: "",
					content: "",
				});
				setFormSuccess(t("articlePage.form.success"));
			} catch (error) {
				const message = error instanceof Error && error.message ? error.message : t("articlePage.form.error");
				setFormError(message);
				toast.error(message);
			} finally {
				setIsSubmitting(false);
			}
		})();
	};

	return (
		<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<section className="rounded-3xl border border-slate-300/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
						{t("articlePage.eyebrow")}
					</p>
					<div className="mt-2 flex flex-wrap items-center justify-between gap-3">
						<h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 sm:text-3xl">{t("articlePage.title")}</h1>
						<button
							type="button"
							onClick={() => void fetchArticles()}
							className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"
						>
							<RefreshCw className="h-4 w-4" />
							{t("articlePage.refresh")}
						</button>
					</div>
					<p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
						{t("articlePage.description")}
					</p>
				</section>

				<section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
					<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
						<h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
							<PenSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
							{t("articlePage.form.title")}
						</h2>

						{canPublish ? (
							<form onSubmit={createArticle} className="mt-4 space-y-3">
								<input
									type="text"
									value={form.title}
									onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
									placeholder={t("articlePage.form.fields.title")}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								/>
								<input
									type="text"
									value={form.summary}
									onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
									placeholder={t("articlePage.form.fields.summary")}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								/>
								<textarea
									value={form.content}
									onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
									placeholder={t("articlePage.form.fields.content")}
									rows={8}
									className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								/>
								{formError && <p className="text-sm text-red-600 dark:text-red-300">{formError}</p>}
								{formSuccess && <p className="text-sm text-emerald-700 dark:text-emerald-300">{formSuccess}</p>}
								<button
									type="submit"
									disabled={isSubmitting}
									className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
								>
									<ShieldCheck className="h-4 w-4" />
									{isSubmitting ? t("articlePage.form.submitting") : t("articlePage.form.submit")}
								</button>
							</form>
						) : (
							<div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
								{t("articlePage.form.restricted")}
							</div>
						)}
					</div>

					<div className="space-y-4">
						{isLoading && (
							<div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
								{t("articlePage.loading")}
							</div>
						)}

						{!isLoading && loadError && (
							<div className="rounded-3xl border border-red-300/70 bg-red-500/5 p-4 text-sm text-red-700 dark:border-red-500/40 dark:text-red-300">
								<p className="inline-flex items-center gap-2">
									<AlertTriangle className="h-4 w-4" />
									{loadError}
								</p>
								<button
									type="button"
									onClick={() => void fetchArticles()}
									className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 font-semibold transition hover:border-red-400 dark:border-red-500/40 dark:hover:border-red-400"
								>
									<RefreshCw className="h-4 w-4" />
									{t("articlePage.actions.retry")}
								</button>
							</div>
						)}

						{!isLoading && !loadError && articles.length === 0 && (
							<div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
								{t("articlePage.empty")}
							</div>
						)}

						{!isLoading && !loadError && articles.map((article, index) => (
							<motion.article
								key={article.id}
								initial={{ opacity: 0, y: 12 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.25 }}
								transition={{ duration: 0.3, delay: index * 0.04 }}
								className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5"
							>
								<h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{article.title}</h3>
								<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{article.summary}</p>
								<p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">{article.content}</p>

								<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
									<span className="inline-flex items-center gap-1">
										<UserRound className="h-4 w-4" />
										{t("articlePage.author")}: {article.authorName || t("articlePage.unknownAuthor")} ({t(`articlePage.roles.${article.authorRole}`)})
									</span>
									<span className="inline-flex items-center gap-1">
										<CalendarDays className="h-4 w-4" />
										{t("articlePage.publishedAt")}: {dateFormatter.format(new Date(article.createdAt))}
									</span>
								</div>
							</motion.article>
						))}
					</div>
				</section>
			</div>
		</main>
	);
};

export default ArticlePage;

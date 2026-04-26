import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, PenSquare, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth/auth-provider";
import { getArticlesApi, createArticleApi, type ArticleItem } from "../../lib/api/articles";
import { isApiError } from "../../lib/api/client";
import { StaffRole } from "../../lib/enums/staff-role.enum";

interface ArticleFormState {
	title: string;
	summary: string;
	content: string;
}

interface ArticlePageProps {
	preview?: boolean;
}

const canWriteArticles = (role: string | undefined): boolean => {
	return role === StaffRole.ADMIN || role === StaffRole.BARBER;
};

const ArticlePage = ({ preview = false }: ArticlePageProps) => {
	const { t, i18n } = useTranslation();
	const { currentUser } = useAuth();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
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
			const data = await getArticlesApi({ page: 1, pageSize: 20 });
			const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			setArticles(sorted);
		} catch (error) {
			const message = isApiError(error) && error.message ? error.message : t("articlePage.loadError");
			setLoadError(message);
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}, [t]);

	useEffect(() => {
		void fetchArticles();
	}, [fetchArticles]);

	const visibleArticles = preview ? articles.slice(0, 3) : articles;

	const createArticle = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!canPublish || !currentUser) {
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
				const created = await createArticleApi({
					title: nextTitle,
					summary: nextSummary,
					content: nextContent,
				});

				if (created) {
					setArticles((prev) => [created, ...prev]);
				} else {
					await fetchArticles();
				}

				setForm({ title: "", summary: "", content: "" });
				setFormSuccess(t("articlePage.form.success"));
			} catch (error) {
				const message = isApiError(error) && error.message ? error.message : t("articlePage.form.error");
				setFormError(message);
				toast.error(message);
			} finally {
				setIsSubmitting(false);
			}
		})();
	};

	const articleList = (
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
					{/* <button
						type="button"
						onClick={() => void fetchArticles()}
						className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-1.5 font-semibold transition hover:border-red-400 dark:border-red-500/40 dark:hover:border-red-400"
					>
						<RefreshCw className="h-4 w-4" />
						{t("articlePage.actions.retry")}
					</button> */}
				</div>
			)}

			{!isLoading && !loadError && articles.length === 0 && (
				<div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
					{t("articlePage.empty")}
				</div>
			)}

			{!isLoading &&
				!loadError &&
				visibleArticles.map((article, index) => (
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
						<p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
							{article.content}
						</p>

						<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
							<span className="inline-flex items-center gap-1">
								<UserRound className="h-4 w-4" />
								{t("articlePage.author")}: {article.authorName || t("articlePage.unknownAuthor")}
							</span>
							<span className="inline-flex items-center gap-1">
								<CalendarDays className="h-4 w-4" />
								{t("articlePage.publishedAt")}: {dateFormatter.format(new Date(article.createdAt))}
							</span>
						</div>
					</motion.article>
				))}

			{preview && !isLoading && articles.length > 0 && (
				<div className="mt-5 flex justify-end">
					<Link
						to={`/${locale}/articles`}
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-slate-400"
					>
						{t("common.more")}
					</Link>
				</div>
			)}
		</div>
	);

	if (preview) {
		return (
			<section className="space-y-4">
				<div className="rounded-3xl border border-slate-300/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
						{t("articlePage.eyebrow")}
					</p>
					<h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-50 sm:text-3xl">
						{t("articlePage.title")}
					</h2>
					<p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300">
						{t("articlePage.description")}
					</p>
				</div>
				{articleList}
			</section>
		);
	}

	return (
		<main className="w-full px-3 pb-14 p-32 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="rounded-3xl border border-slate-300/70 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
						{t("articlePage.eyebrow")}
					</p>
					<div className="mt-2 flex flex-wrap items-center justify-between gap-3">
						<h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 sm:text-3xl">
							{t("articlePage.title")}
						</h1>
						{/* <button
							type="button"
							onClick={() => void fetchArticles()}
							className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"
						>
							<RefreshCw className="h-4 w-4" />
							{t("articlePage.refresh")}
						</button> */}
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

					{articleList}
				</section>
			</div>
		</main>
	);
};

export default ArticlePage;

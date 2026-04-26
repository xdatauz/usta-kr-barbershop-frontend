import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, MessageCircle, Send, ShieldAlert } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Skeleton from "../../components/ui/Skeleton";
import { CONTACT } from "../../constants/contact";
import {
	getBarberApi,
	getBarberCommentsApi,
	type BarberComment,
	type BarberProfile,
	type BarberStats,
	type BarberViewer,
} from "../../lib/api/barbers";
import { isApiError } from "../../lib/api/client";
import { buildFallbackBarbers, withUiFallback } from "./helpers";
import useBarberActions from "./hooks/useBarberActions";

const BarberProfilePage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const { barberId } = useParams();
	const locale = location.pathname.split("/")[1] || "uz";

	const [activeBarber, setActiveBarber] = useState<BarberProfile | null>(null);
	const [comments, setComments] = useState<BarberComment[]>([]);
	const [commentText, setCommentText] = useState("");
	const [reportReason, setReportReason] = useState("");
	const [reportDetails, setReportDetails] = useState("");
	const [reportStatus, setReportStatus] = useState<"idle" | "sent" | "error">("idle");
	const [isLoadingProfile, setIsLoadingProfile] = useState(false);

	const fallbackBarbers = useMemo(() => buildFallbackBarbers(t), [t]);

	const updateActiveBarberState = useCallback(
		(id: string, stats: Partial<BarberStats>, viewerPatch?: Partial<BarberViewer>) => {
			setActiveBarber((prev) => {
				if (!prev || prev.id !== id) return prev;
				return {
					...prev,
					stats: { ...prev.stats, ...stats },
					viewer: viewerPatch ? ({ ...prev.viewer, ...viewerPatch } as BarberViewer) : prev.viewer,
				};
			});
		},
		[],
	);

	const {
		isActionLoading,
		submitComment,
		submitReport,
	} = useBarberActions({
		onStatsChange: updateActiveBarberState,
		onCommentsChange: (updater) => setComments((prev) => updater(prev)),
	});

	const loadBarberProfile = useCallback(
		async (id: string) => {
			setIsLoadingProfile(true);
			try {
				const [profileResult, commentsResult] = await Promise.allSettled([
					getBarberApi(id),
					getBarberCommentsApi(id),
				]);

				if (profileResult.status === "fulfilled") {
					setActiveBarber(withUiFallback(profileResult.value, t));
				} else {
					const fallback = fallbackBarbers.find((barber) => barber.id === id) || null;
					setActiveBarber(fallback);
					const message =
						isApiError(profileResult.reason) && profileResult.reason.message
							? profileResult.reason.message
							: t("toast.barbers.loadProfileFailed");
					toast.error(message);
				}

				if (commentsResult.status === "fulfilled") {
					setComments(commentsResult.value.items);
				} else {
					setComments([]);
					const message =
						isApiError(commentsResult.reason) && commentsResult.reason.message
							? commentsResult.reason.message
							: t("toast.barbers.loadCommentsFailed");
					toast.warning(message);
				}
			} finally {
				setIsLoadingProfile(false);
			}
		},
		[fallbackBarbers, t],
	);

	useEffect(() => {
		if (barberId) void loadBarberProfile(barberId);
	}, [barberId, loadBarberProfile]);

	if (isLoadingProfile) {
		return (
			<main
				className="w-full px-3 pb-14 pt-32 sm:px-5 lg:px-8"
				aria-busy="true"
				aria-label={t("barbersPage.loadingProfile")}
			>
				<div className="mx-auto max-w-7xl space-y-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<Skeleton className="h-9 w-32" />
						<Skeleton className="h-9 w-44" />
					</div>
					<section className="grid gap-5 rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6 lg:grid-cols-[380px_1fr]">
						<Skeleton className="h-80 w-full rounded-2xl" />
						<div className="space-y-3">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-8 w-2/3" />
							<Skeleton className="h-3 w-40" />
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-11/12" />
							<Skeleton className="h-3 w-10/12" />
						</div>
					</section>
					<section className="grid gap-5 lg:grid-cols-2">
						<Skeleton className="h-56 w-full rounded-3xl" />
						<Skeleton className="h-56 w-full rounded-3xl" />
					</section>
				</div>
			</main>
		);
	}

	if (!activeBarber) {
		return (
			<main className="w-full px-3 pb-14 pt-32 sm:px-5 lg:px-8">
				<div className="mx-auto max-w-7xl rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
					{t("barbersPage.notFound")}
				</div>
			</main>
		);
	}

	const activeId = activeBarber.id;
	const stats = activeBarber.stats;
	const pageTitle = `${activeBarber.name} — ${t("nav.barbers")} | ${CONTACT.siteName}`;
	const pageDescription = activeBarber.bio
		? activeBarber.bio.slice(0, 160)
		: `${activeBarber.name} — ${t("barbersPage.profileEyebrow")}. ${CONTACT.siteName}.`;
	const canonical = `${CONTACT.siteUrl}/${locale}/barbers/${activeBarber.id}`;

	return (
		<main className="w-full px-3 pb-14 pt-32 sm:px-5 lg:px-8">
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDescription} />
				<link rel="canonical" href={canonical} />
				<meta property="og:title" content={pageTitle} />
				<meta property="og:description" content={pageDescription} />
				<meta property="og:type" content="profile" />
				<meta property="og:url" content={canonical} />
				{activeBarber.image && <meta property="og:image" content={activeBarber.image} />}
			</Helmet>
			<div className="mx-auto max-w-7xl space-y-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Link
						to={`/${locale}/barbers`}
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"
					>
						{t("barbersPage.backToList")}
					</Link>
					<Link
						to={`/${locale}/booking?barberId=${activeBarber.id}&barberName=${encodeURIComponent(activeBarber.name)}`}
						className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
					>
						{t("barbersPage.bookWithBarber")}
					</Link>
				</div>

				<section className="grid gap-5 rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6 lg:grid-cols-[380px_1fr]">
					<div className="overflow-hidden rounded-2xl border border-slate-300/70 dark:border-slate-700">
						<img src={activeBarber.image} alt={activeBarber.name} className="h-full w-full object-cover object-top" />
					</div>

					<div className="space-y-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
								{t("barbersPage.profileEyebrow")}
							</p>
							<h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">{activeBarber.name}</h1>
							<p className="text-sm uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
								{activeBarber.role}
							</p>
							<p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{activeBarber.bio}</p>
						</div>

						<div className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
							<MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
							<span className="text-slate-700 dark:text-slate-300">
								{comments.length} {t("barbersPage.reviews")}
							</span>
						</div>
					</div>
				</section>

				<section className="grid gap-5 lg:grid-cols-2">
					<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
						<h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
							<MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
							{t("barbersPage.commentsTitle")}
						</h2>

						<form
							onSubmit={(event) => void submitComment(event, activeId, commentText, () => setCommentText(""))}
							className="mt-4 space-y-3"
						>
							<textarea
								value={commentText}
								onChange={(event) => setCommentText(event.target.value)}
								placeholder={t("barbersPage.commentForm.message")}
								rows={4}
								className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
							/>
							<button
								type="submit"
								disabled={isActionLoading}
								className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
							>
								<Send className="h-4 w-4" />
								{t("barbersPage.commentForm.submit")}
							</button>
						</form>

						<div className="mt-4 space-y-3">
							{comments.length === 0 && (
								<p className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
									{t("barbersPage.noComments")}
								</p>
							)}
							{comments.map((comment) => (
								<div
									key={comment.id}
									className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60"
								>
									<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{comment.author}</p>
									<p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
						<h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
							<ShieldAlert className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
							{t("barbersPage.reportTitle")}
						</h2>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("barbersPage.reportDescription")}</p>

						<div className="mt-4 space-y-3">
							<select
								value={reportReason}
								onChange={(event) => {
									setReportReason(event.target.value);
									setReportStatus("idle");
								}}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
							>
								<option value="">{t("barbersPage.reportForm.placeholder")}</option>
								<option value="spam">{t("barbersPage.reportForm.reasons.spam")}</option>
								<option value="offensive">{t("barbersPage.reportForm.reasons.offensive")}</option>
								<option value="other">{t("barbersPage.reportForm.reasons.other")}</option>
							</select>
							{reportReason === "other" && (
								<textarea
									value={reportDetails}
									onChange={(e) => setReportDetails(e.target.value)}
									placeholder={t("barbersPage.reportForm.detailsPlaceholder")}
									maxLength={1000}
									rows={3}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 resize-none"
								/>
							)}
							<button
								type="button"
								disabled={isActionLoading}
								onClick={() =>
									void submitReport(
										activeId,
										reportReason,
										reportDetails,
										() => {
											setReportReason("");
											setReportDetails("");
											setReportStatus("sent");
										},
										() => setReportStatus("error"),
									)
								}
								className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-400/40 dark:text-red-300"
							>
								<AlertTriangle className="h-4 w-4" />
								{t("barbersPage.reportForm.submit")}
							</button>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{t("barbersPage.reportCount")}: {stats.reports || 0}
							</p>

							{reportStatus === "sent" && (
								<p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
									{t("barbersPage.reportForm.success")}
								</p>
							)}
							{reportStatus === "error" && (
								<p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
									{t("barbersPage.reportForm.error")}
								</p>
							)}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
};

export default BarberProfilePage;

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Heart, MessageCircle, ShieldAlert, ThumbsDown, ThumbsUp, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth/auth-provider";
import { BARBER_MEDIA, type BarberId } from "../../lib/barbers";
import {
	dislikeBarberApi,
	followBarberApi,
	getBarberApi,
	getBarberCommentsApi,
	getBarbersApi,
	likeBarberApi,
	postBarberCommentApi,
	reportBarberApi,
	type BarberComment,
	type BarberProfile,
	type BarberStats,
	type BarberViewer,
	unfollowBarberApi,
} from "../../lib/api/barbers";
import { isApiError } from "../../lib/api/client";

const EMPTY_STATS: BarberStats = {
	likes: 0,
	dislikes: 0,
	followers: 0,
	reports: 0,
};

const toBarberId = (value: string): BarberId | null => {
	const id = BARBER_MEDIA.find((barber) => barber.id === value);
	return id ? id.id : null;
};

const withUiFallback = (barber: BarberProfile, t: (key: string) => string): BarberProfile => {
	const safeId = toBarberId(barber.id);
	const fallbackImage = safeId ? BARBER_MEDIA.find((item) => item.id === safeId)?.image || "" : "";

	return {
		...barber,
		name: barber.name || (safeId ? t(`barbersPage.barbers.${safeId}.name`) : barber.id),
		role: barber.role || (safeId ? t(`barbersPage.barbers.${safeId}.role`) : ""),
		bio: barber.bio || (safeId ? t(`barbersPage.barbers.${safeId}.bio`) : ""),
		image: barber.image || fallbackImage,
		stats: {
			...EMPTY_STATS,
			...barber.stats,
		},
		viewer: {
			isFollowing: Boolean(barber.viewer?.isFollowing),
			liked: Boolean(barber.viewer?.liked),
			disliked: Boolean(barber.viewer?.disliked),
		},
	};
};

const buildFallbackBarbers = (t: (key: string) => string): BarberProfile[] => {
	return BARBER_MEDIA.map((barber) => ({
		id: barber.id,
		name: t(`barbersPage.barbers.${barber.id}.name`),
		role: t(`barbersPage.barbers.${barber.id}.role`),
		bio: t(`barbersPage.barbers.${barber.id}.bio`),
		image: barber.image,
		stats: EMPTY_STATS,
		viewer: { isFollowing: false, liked: false, disliked: false },
	}));
};

const BarbersPage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const { barberId } = useParams();
	const locale = location.pathname.split("/")[1] || "uz";
	const { currentUser } = useAuth();
	const [barbers, setBarbers] = useState<BarberProfile[]>([]);
	const [activeBarber, setActiveBarber] = useState<BarberProfile | null>(null);
	const [comments, setComments] = useState<BarberComment[]>([]);
	const [commentText, setCommentText] = useState("");
	const [reportReason, setReportReason] = useState("");
	const [reportDetails, setReportDetails] = useState("");
	const [reportStatus, setReportStatus] = useState<"idle" | "sent" | "error">("idle");
	const [isLoadingList, setIsLoadingList] = useState(false);
	const [isLoadingProfile, setIsLoadingProfile] = useState(false);
	const [isActionLoading, setIsActionLoading] = useState(false);

	const fallbackBarbers = useMemo(() => buildFallbackBarbers(t), [t]);

	const requireAuth = () => {
		if (!currentUser) {
			toast.warning(t("toast.auth.required"));
			return false;
		}
		return true;
	};

	const mergeStatsIntoList = useCallback(
		(id: string, stats: Partial<BarberStats>, viewerPatch?: Partial<BarberViewer>) => {
			setBarbers((prev) =>
				prev.map((barber) =>
					barber.id === id
						? {
								...barber,
								stats: { ...barber.stats, ...stats },
								viewer: viewerPatch ? ({ ...barber.viewer, ...viewerPatch } as BarberViewer) : barber.viewer,
							}
						: barber,
				),
			);
		},
		[],
	);

	const updateActiveBarberState = useCallback(
		(id: string, stats: Partial<BarberStats>, viewerPatch?: Partial<BarberViewer>) => {
			setActiveBarber((prev) => {
				if (!prev || prev.id !== id) {
					return prev;
				}
				return {
					...prev,
					stats: { ...prev.stats, ...stats },
					viewer: viewerPatch ? ({ ...prev.viewer, ...viewerPatch } as BarberViewer) : prev.viewer,
				};
			});
		},
		[],
	);

	const loadBarbers = useCallback(async () => {
		setIsLoadingList(true);
		try {
			const list = await getBarbersApi();
			if (!list.length) {
				setBarbers(fallbackBarbers);
				return;
			}
			setBarbers(list.map((barber) => withUiFallback(barber, t)));
		} catch (error) {
			const message = isApiError(error) && error.message ? error.message : t("toast.barbers.loadListFailed");
			toast.error(message);
			setBarbers(fallbackBarbers);
		} finally {
			setIsLoadingList(false);
		}
	}, [fallbackBarbers, t]);

	const loadBarberProfile = useCallback(
		async (id: string) => {
			setIsLoadingProfile(true);
			try {
				const [profileResult, commentsResult] = await Promise.allSettled([getBarberApi(id), getBarberCommentsApi(id)]);

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
		if (barberId) {
			void loadBarberProfile(barberId);
			return;
		}

		void loadBarbers();
	}, [barberId, loadBarberProfile, loadBarbers]);

	const likeBarber = async (id: string) => {
		if (!requireAuth()) return;
		setIsActionLoading(true);
		try {
			const result = await likeBarberApi(id);
			if (result) {
				const viewerPatch = { liked: result.liked, disliked: result.disliked };
				mergeStatsIntoList(id, result.stats, viewerPatch);
				updateActiveBarberState(id, result.stats, viewerPatch);
			}
			toast.success(t("toast.barbers.likeSuccess"));
		} catch (error) {
			const message = isApiError(error) && error.message ? error.message : t("toast.barbers.likeFailed");
			toast.error(message);
		} finally {
			setIsActionLoading(false);
		}
	};

	const dislikeBarber = async (id: string) => {
		if (!requireAuth()) return;
		setIsActionLoading(true);
		try {
			const result = await dislikeBarberApi(id);
			if (result) {
				const viewerPatch = { liked: result.liked, disliked: result.disliked };
				mergeStatsIntoList(id, result.stats, viewerPatch);
				updateActiveBarberState(id, result.stats, viewerPatch);
			}
			toast.success(t("toast.barbers.dislikeSuccess"));
		} catch (error) {
			const message = isApiError(error) && error.message ? error.message : t("toast.barbers.dislikeFailed");
			toast.error(message);
		} finally {
			setIsActionLoading(false);
		}
	};

	const toggleFollow = async (id: string, currentFollowingState: boolean) => {
		if (!requireAuth()) return;
		setIsActionLoading(true);
		try {
			const response = currentFollowingState ? await unfollowBarberApi(id) : await followBarberApi(id);
			const newIsFollowing = !currentFollowingState;
			mergeStatsIntoList(id, { followers: response.followers }, { isFollowing: newIsFollowing });
			updateActiveBarberState(id, { followers: response.followers }, { isFollowing: newIsFollowing });
			toast.success(newIsFollowing ? t("toast.barbers.followSuccess") : t("toast.barbers.unfollowSuccess"));
		} catch (error) {
			const message = isApiError(error) && error.message ? error.message : t("toast.barbers.followFailed");
			toast.error(message);
		} finally {
			setIsActionLoading(false);
		}
	};

	const submitComment = async (event: FormEvent<HTMLFormElement>, id: string) => {
		event.preventDefault();

		if (!requireAuth()) {
			return;
		}

		if (!commentText.trim()) {
			toast.warning(t("toast.validation.commentRequired"));
			return;
		}

		setIsActionLoading(true);
		try {
			const created = await postBarberCommentApi(id, {
				text: commentText.trim(),
			});

			if (created) {
				setComments((prev) => [created, ...prev]);
			} else {
				const latest = await getBarberCommentsApi(id);
				setComments(latest.items);
			}

			setCommentText("");
			toast.success(t("toast.barbers.commentSuccess"));
		} catch (error) {
			const message = isApiError(error) && error.message ? error.message : t("toast.barbers.commentFailed");
			toast.error(message);
		} finally {
			setIsActionLoading(false);
		}
	};

	const submitReport = async (id: string) => {
		if (!requireAuth()) {
			return;
		}

		if (!reportReason) {
			setReportStatus("error");
			toast.warning(t("toast.validation.reportReasonRequired"));
			return;
		}

		setIsActionLoading(true);
		try {
			await reportBarberApi(id, {
				reason: reportReason,
				details: reportDetails.trim() || undefined,
			});
			setReportReason("");
			setReportDetails("");
			setReportStatus("sent");
			toast.success(t("toast.barbers.reportSuccess"));
		} catch (error) {
			setReportStatus("error");
			const message = isApiError(error) && error.message ? error.message : t("toast.barbers.reportFailed");
			toast.error(message);
		} finally {
			setIsActionLoading(false);
		}
	};

	if (!barberId) {
		return (
			<main className="w-full px-3 pb-14 p-32 sm:px-5 lg:px-8">
				<div className="mx-auto max-w-7xl space-y-6">
					<section className="rounded-3xl border border-slate-300/70 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-8">
						<h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{t("barbersPage.title")}</h1>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("barbersPage.description")}</p>
					</section>

					{isLoadingList ? (
						<section className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
							{t("barbersPage.loadingList")}
						</section>
					) : (
						<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{barbers.map((barber, index) => {
								const stats = barber.stats;
								return (
									<motion.article
										key={barber.id}
										initial={{ opacity: 0, y: 12 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true, amount: 0.3 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										className="overflow-hidden rounded-2xl border border-slate-300/70 bg-white dark:border-slate-700 dark:bg-slate-900"
									>
										<img src={barber.image} alt={barber.name} className="h-72 w-full object-cover object-top" />
										<div className="space-y-3 p-4">
											<div>
												<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{barber.name}</h2>
												<p className="text-xs uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
													{barber.role}
												</p>
											</div>
											<p className="text-sm text-slate-700 dark:text-slate-300">{barber.bio}</p>
											<div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
												<span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">
													<ThumbsUp className="h-3.5 w-3.5" /> {stats.likes}
												</span>
												<span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">
													<ThumbsDown className="h-3.5 w-3.5" /> {stats.dislikes}
												</span>
												<span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">
													<Heart className="h-3.5 w-3.5" /> {stats.followers}
												</span>
											</div>
											<Link
												to={`/${locale}/barbers/${barber.id}`}
												className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
											>
												{t("barbersPage.viewProfile")}
											</Link>
										</div>
									</motion.article>
								);
							})}
						</section>
					)}
				</div>
			</main>
		);
	}

	if (isLoadingProfile) {
		return (
			<main className="w-full px-3 pb-14 p-32 sm:px-5 lg:px-8">
				<div className="mx-auto max-w-7xl rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
					{t("barbersPage.loadingProfile")}
				</div>
			</main>
		);
	}

	if (!activeBarber) {
		return (
			<main className="w-full px-3 pb-14 p-32 sm:px-5 lg:px-8">
				<div className="mx-auto max-w-7xl rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
					{t("barbersPage.notFound")}
				</div>
			</main>
		);
	}

	const activeId = activeBarber.id;
	const stats = activeBarber.stats;
	const isFollowing = Boolean(activeBarber.viewer?.isFollowing);
	const isLiked = Boolean(activeBarber.viewer?.liked);
	const isDisliked = Boolean(activeBarber.viewer?.disliked);

	return (
		<main className="w-full px-3 pb-14 p-32 sm:px-5 lg:px-8">
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

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								disabled={isActionLoading}
								onClick={() => void toggleFollow(activeId, isFollowing)}
								className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
									isFollowing
										? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200"
										: "bg-slate-900 text-white hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
								}`}
							>
								<UserPlus className="h-4 w-4" />
								{isFollowing ? t("barbersPage.following") : t("barbersPage.follow")}
							</button>
							<button
								type="button"
								disabled={isActionLoading}
								onClick={() => void likeBarber(activeId)}
								className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${isLiked ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200" : "border border-slate-300 text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"}`}
							>
								<ThumbsUp className="h-4 w-4" />
								{t("barbersPage.like")}
							</button>
							<button
								type="button"
								disabled={isActionLoading}
								onClick={() => void dislikeBarber(activeId)}
								className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${isDisliked ? "bg-red-500/20 text-red-700 dark:text-red-300" : "border border-slate-300 text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"}`}
							>
								<ThumbsDown className="h-4 w-4" />
								{t("barbersPage.dislike")}
							</button>
						</div>

						<div className="grid gap-3 sm:grid-cols-4">
							<div className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
								<div className="inline-flex items-center gap-1.5">
									<Heart className="h-4 w-4 text-red-500" />
									<p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
										{t("barbersPage.followers")}
									</p>
								</div>
								<p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-50">{stats.followers}</p>
							</div>
							<div className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
								<div className="inline-flex items-center gap-1.5">
									<ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
									<p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
										{t("barbersPage.likes")}
									</p>
								</div>
								<p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-50">{stats.likes}</p>
							</div>
							<div className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
								<div className="inline-flex items-center gap-1.5">
									<ThumbsDown className="h-4 w-4 text-red-600 dark:text-red-400" />
									<p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
										{t("barbersPage.dislikes")}
									</p>
								</div>
								<p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-50">{stats.dislikes}</p>
							</div>
							<div className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
								<div className="inline-flex items-center gap-1.5">
									<MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
									<p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
										{t("barbersPage.comments")}
									</p>
								</div>
								<p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-50">{comments.length}</p>
							</div>
						</div>
					</div>
				</section>

				<section className="grid gap-5 lg:grid-cols-2">
					<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
						<h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
							<MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
							{t("barbersPage.commentsTitle")}
						</h2>

						<form onSubmit={(event) => void submitComment(event, activeId)} className="mt-4 space-y-3">
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
								<Heart className="h-4 w-4" />
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
								onClick={() => void submitReport(activeId)}
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

export default BarbersPage;

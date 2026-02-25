import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Heart, MessageCircle, ShieldAlert, ThumbsDown, ThumbsUp, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import { BARBER_IDS, BARBER_MEDIA, type BarberId } from "../../lib/barbers";

interface BarberComment {
	id: string;
	author: string;
	text: string;
	createdAt: string;
}

interface BarberCommunityState {
	likes: number;
	dislikes: number;
	followers: number;
	isFollowing: boolean;
	reports: number;
	comments: BarberComment[];
}

type BarberCommunityMap = Record<BarberId, BarberCommunityState>;

const STORAGE_KEY = "usta_barber_community_v1";
// TODO(back-end): migrate likes/comments/follows/reports from localStorage to API endpoints with auth checks.

const defaultCommunityState = (): BarberCommunityMap => ({
	jamshid: {
		likes: 94,
		dislikes: 3,
		followers: 243,
		isFollowing: false,
		reports: 0,
		comments: [],
	},
	sardor: {
		likes: 82,
		dislikes: 4,
		followers: 198,
		isFollowing: false,
		reports: 0,
		comments: [],
	},
	aziz: {
		likes: 77,
		dislikes: 5,
		followers: 173,
		isFollowing: false,
		reports: 0,
		comments: [],
	},
	doston: {
		likes: 68,
		dislikes: 2,
		followers: 149,
		isFollowing: false,
		reports: 0,
		comments: [],
	},
	islom: {
		likes: 63,
		dislikes: 1,
		followers: 138,
		isFollowing: false,
		reports: 0,
		comments: [],
	},
});

const getStoredCommunity = (): BarberCommunityMap => {
	const fallback = defaultCommunityState();
	const raw = localStorage.getItem(STORAGE_KEY);

	if (!raw) {
		return fallback;
	}

	try {
		const parsed = JSON.parse(raw) as Partial<BarberCommunityMap>;
		const merged = { ...fallback };

		BARBER_IDS.forEach((id) => {
			const source = parsed[id];
			if (!source) {
				return;
			}

			merged[id] = {
				likes: typeof source.likes === "number" ? source.likes : fallback[id].likes,
				dislikes: typeof source.dislikes === "number" ? source.dislikes : fallback[id].dislikes,
				followers: typeof source.followers === "number" ? source.followers : fallback[id].followers,
				isFollowing: typeof source.isFollowing === "boolean" ? source.isFollowing : fallback[id].isFollowing,
				reports: typeof source.reports === "number" ? source.reports : fallback[id].reports,
				comments: Array.isArray(source.comments) ? source.comments : fallback[id].comments,
			};
		});

		return merged;
	} catch {
		return fallback;
	}
};

const BarbersPage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const { barberId } = useParams();
	const locale = location.pathname.split("/")[1] || "uz";
	const [community, setCommunity] = useState<BarberCommunityMap>(getStoredCommunity);
	const [commentAuthor, setCommentAuthor] = useState("");
	const [commentText, setCommentText] = useState("");
	const [reportReason, setReportReason] = useState("");
	const [reportStatus, setReportStatus] = useState<"idle" | "sent" | "error">("idle");

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(community));
	}, [community]);

	const activeBarber = useMemo(() => BARBER_MEDIA.find((barber) => barber.id === barberId), [barberId]);

	const likeBarber = (id: BarberId) => {
		setCommunity((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				likes: prev[id].likes + 1,
			},
		}));
	};

	const dislikeBarber = (id: BarberId) => {
		setCommunity((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				dislikes: prev[id].dislikes + 1,
			},
		}));
	};

	const toggleFollow = (id: BarberId) => {
		setCommunity((prev) => {
			const isFollowing = prev[id].isFollowing;
			const nextFollowers = isFollowing ? Math.max(prev[id].followers - 1, 0) : prev[id].followers + 1;

			return {
				...prev,
				[id]: {
					...prev[id],
					isFollowing: !isFollowing,
					followers: nextFollowers,
				},
			};
		});
	};

	const submitComment = (event: FormEvent<HTMLFormElement>, id: BarberId) => {
		event.preventDefault();

		if (!commentText.trim()) {
			return;
		}

		const newComment: BarberComment = {
			id: crypto.randomUUID(),
			author: commentAuthor.trim() || t("barbersPage.guestName"),
			text: commentText.trim(),
			createdAt: new Date().toISOString(),
		};

		setCommunity((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				comments: [newComment, ...prev[id].comments],
			},
		}));

		setCommentText("");
		setCommentAuthor("");
	};

	const submitReport = (id: BarberId) => {
		if (!reportReason) {
			setReportStatus("error");
			return;
		}

		setCommunity((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				reports: prev[id].reports + 1,
			},
		}));

		setReportReason("");
		setReportStatus("sent");
	};

	if (!activeBarber) {
		return (
			<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
				<div className="mx-auto max-w-6xl space-y-6">
					<section className="rounded-3xl border border-slate-300/70 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-8">
						<h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{t("barbersPage.title")}</h1>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("barbersPage.description")}</p>
					</section>

					<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{BARBER_MEDIA.map((barber, index) => {
							const stats = community[barber.id];
							return (
								<motion.article
									key={barber.id}
									initial={{ opacity: 0, y: 12 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, amount: 0.3 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className="overflow-hidden rounded-2xl border border-slate-300/70 bg-white dark:border-slate-700 dark:bg-slate-900"
								>
									<img
										src={barber.image}
										alt={t(`barbersPage.barbers.${barber.id}.name`)}
										className="h-72 w-full object-cover object-top"
									/>
									<div className="space-y-3 p-4">
										<div>
											<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t(`barbersPage.barbers.${barber.id}.name`)}</h2>
											<p className="text-xs uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">{t(`barbersPage.barbers.${barber.id}.role`)}</p>
										</div>
										<p className="text-sm text-slate-700 dark:text-slate-300">{t(`barbersPage.barbers.${barber.id}.bio`)}</p>
										<div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
											<span className="rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">👍 {stats.likes}</span>
											<span className="rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">👎 {stats.dislikes}</span>
											<span className="rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">❤️ {stats.followers}</span>
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
				</div>
			</main>
		);
	}

	const activeId = activeBarber.id;
	const stats = community[activeId];

	return (
		<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-6xl space-y-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Link
						to={`/${locale}/barbers`}
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"
					>
						{t("barbersPage.backToList")}
					</Link>
					<Link
						to={`/${locale}/booking`}
						className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
					>
						{t("barbersPage.bookWithBarber")}
					</Link>
				</div>

				<section className="grid gap-5 rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6 lg:grid-cols-[380px_1fr]">
					<div className="overflow-hidden rounded-2xl border border-slate-300/70 dark:border-slate-700">
						<img src={activeBarber.image} alt={t(`barbersPage.barbers.${activeId}.name`)} className="h-full w-full object-cover object-top" />
					</div>

					<div className="space-y-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">{t("barbersPage.profileEyebrow")}</p>
							<h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">{t(`barbersPage.barbers.${activeId}.name`)}</h1>
							<p className="text-sm uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{t(`barbersPage.barbers.${activeId}.role`)}</p>
							<p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{t(`barbersPage.barbers.${activeId}.bio`)}</p>
						</div>

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => toggleFollow(activeId)}
								className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
									stats.isFollowing
										? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200"
										: "bg-slate-900 text-white hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
								}`}
							>
								<UserPlus className="h-4 w-4" />
								{stats.isFollowing ? t("barbersPage.following") : t("barbersPage.follow")}
							</button>
							<button
								type="button"
								onClick={() => likeBarber(activeId)}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"
							>
								<ThumbsUp className="h-4 w-4" />
								{t("barbersPage.like")}
							</button>
							<button
								type="button"
								onClick={() => dislikeBarber(activeId)}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-400"
							>
								<ThumbsDown className="h-4 w-4" />
								{t("barbersPage.dislike")}
							</button>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							<div className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
								<p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{t("barbersPage.followers")}</p>
								<p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-50">{stats.followers}</p>
							</div>
							<div className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
								<p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{t("barbersPage.likes")}</p>
								<p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-50">{stats.likes}</p>
							</div>
							<div className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/60">
								<p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{t("barbersPage.dislikes")}</p>
								<p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-50">{stats.dislikes}</p>
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

						<form onSubmit={(event) => submitComment(event, activeId)} className="mt-4 space-y-3">
							<input
								type="text"
								value={commentAuthor}
								onChange={(event) => setCommentAuthor(event.target.value)}
								placeholder={t("barbersPage.commentForm.author")}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
							/>
							<textarea
								value={commentText}
								onChange={(event) => setCommentText(event.target.value)}
								placeholder={t("barbersPage.commentForm.message")}
								rows={4}
								className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
							/>
							<button
								type="submit"
								className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
							>
								<Heart className="h-4 w-4" />
								{t("barbersPage.commentForm.submit")}
							</button>
						</form>

						<div className="mt-4 space-y-3">
							{stats.comments.length === 0 && (
								<p className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
									{t("barbersPage.noComments")}
								</p>
							)}
							{stats.comments.map((comment) => (
								<div key={comment.id} className="rounded-xl border border-slate-300/70 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
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
							<button
								type="button"
								onClick={() => submitReport(activeId)}
								className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 dark:border-red-400/40 dark:text-red-300"
							>
								<AlertTriangle className="h-4 w-4" />
								{t("barbersPage.reportForm.submit")}
							</button>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								{t("barbersPage.reportCount")}: {stats.reports}
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

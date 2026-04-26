import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Skeleton from "../../components/ui/Skeleton";
import { getBarbersApi, type BarberProfile } from "../../lib/api/barbers";
import { isApiError } from "../../lib/api/client";
import { buildFallbackBarbers, computeBarberRating, withUiFallback } from "./helpers";

const renderStars = (value: number) => {
	const full = Math.floor(value);
	const hasHalf = value - full >= 0.5;
	const items: ReactNode[] = [];
	for (let i = 0; i < 5; i++) {
		const isFull = i < full;
		const isHalf = !isFull && i === full && hasHalf;
		items.push(
			<Star
				key={i}
				className={`h-3.5 w-3.5 ${
					isFull || isHalf
						? "fill-amber-400 text-amber-400"
						: "text-slate-300 dark:text-slate-600"
				}`}
			/>,
		);
	}
	return items;
};

const BarberListPage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
	const [barbers, setBarbers] = useState<BarberProfile[]>([]);
	const [isLoadingList, setIsLoadingList] = useState(false);

	const fallbackBarbers = useMemo(() => buildFallbackBarbers(t), [t]);

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

	useEffect(() => {
		void loadBarbers();
	}, [loadBarbers]);

	return (
		<main className="w-full px-3 pb-14 pt-32 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="rounded-3xl border border-slate-300/70 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-8">
					<h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{t("barbersPage.title")}</h1>
					<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("barbersPage.description")}</p>
				</section>

				{isLoadingList ? (
					<section
						className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
						aria-busy="true"
						aria-label={t("barbersPage.loadingList")}
					>
						{Array.from({ length: 6 }).map((_, idx) => (
							<div
								key={idx}
								className="overflow-hidden rounded-2xl border border-slate-300/70 bg-white dark:border-slate-700 dark:bg-slate-900"
							>
								<Skeleton className="h-72 w-full rounded-none" />
								<div className="space-y-3 p-4">
									<Skeleton className="h-5 w-2/3" />
									<Skeleton className="h-3 w-1/3" />
									<Skeleton className="h-3 w-full" />
									<Skeleton className="h-3 w-5/6" />
									<Skeleton className="h-9 w-32" />
								</div>
							</div>
						))}
					</section>
				) : (
					<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{barbers.map((barber, index) => {
							const rating = computeBarberRating(barber.stats);
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
										<div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
											{rating.isNew ? (
												<span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
													<Sparkles className="h-3.5 w-3.5" /> {t("barbersPage.newBadge")}
												</span>
											) : (
												<>
													<span
														className="inline-flex items-center gap-0.5"
														aria-label={`${rating.stars} / 5`}
													>
														{renderStars(rating.stars)}
													</span>
													<span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 dark:border-slate-700">
														<MessageSquare className="h-3.5 w-3.5" />
														{rating.totalReviews} {t("barbersPage.reviews")}
													</span>
												</>
											)}
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
};

export default BarberListPage;

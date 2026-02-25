import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface HomeHeroProps {
	onExploreMore?: () => void;
	hasRevealedSections?: boolean;
}

const HomeHero = ({ onExploreMore, hasRevealedSections = false }: HomeHeroProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	const handleExplore = () => {
		if (onExploreMore) {
			onExploreMore();
			return;
		}

		window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" });
  };
  
  // TODO: Ushbu qismda ma'lumotlar bilan ishlashim kerak

	return (
		<section className="relative isolate overflow-hidden rounded-3xl border border-slate-300/70 bg-gradient-to-br from-white to-slate-100 dark:border-slate-700/80 dark:from-slate-900 dark:to-slate-950">
			<div className="absolute inset-0">
				<img src="/images/home/1.webp" alt="" className="h-full w-full object-cover opacity-30 dark:opacity-25" />
				<div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent" />
			</div>

			<div className="relative grid gap-10 px-5 py-10 sm:px-8 md:px-10 lg:grid-cols-[1.2fr_1fr] lg:py-16">
				<div className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45 }}
						className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300"
					>
						<Sparkles className="h-3.5 w-3.5" />
						{t("homeHero.badge")}
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.05 }}
						className="max-w-2xl text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-50"
					>
						{t("homeHero.title")}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.1 }}
						className="max-w-xl text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300"
					>
						{t("homeHero.subtitle")}
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.15 }}
						className="flex flex-col items-start gap-3 sm:flex-row"
					>
						<Link
							to={`/${locale}/booking`}
							className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
						>
							<CalendarDays className="h-4 w-4" />
							{t("homeHero.primaryCta")}
						</Link>
						<button
							type="button"
							onClick={handleExplore}
							className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-white dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-slate-400"
						>
							{hasRevealedSections ? t("homeHero.revealDone") : t("homeHero.secondaryCta")}
							<ArrowRight className="h-4 w-4" />
						</button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="grid max-w-xl grid-cols-3 gap-3 pt-2"
					>
						<div className="rounded-xl border border-slate-300/70 bg-white/60 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
							<p className="text-lg font-bold text-slate-900 dark:text-white">12+</p>
							<p className="text-[11px] uppercase tracking-[0.14em] text-slate-600 dark:text-slate-400">{t("homeHero.stats.years")}</p>
						</div>
						<div className="rounded-xl border border-slate-300/70 bg-white/60 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
							<p className="text-lg font-bold text-slate-900 dark:text-white">8k+</p>
							<p className="text-[11px] uppercase tracking-[0.14em] text-slate-600 dark:text-slate-400">{t("homeHero.stats.clients")}</p>
						</div>
						<div className="rounded-xl border border-slate-300/70 bg-white/60 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
							<p className="text-lg font-bold text-slate-900 dark:text-white">4.9</p>
							<p className="text-[11px] uppercase tracking-[0.14em] text-slate-600 dark:text-slate-400">{t("homeHero.stats.rating")}</p>
						</div>
					</motion.div>
				</div>

				<div className="grid grid-cols-2 gap-3 sm:gap-4">
					<motion.img
						initial={{ opacity: 0, y: 20, rotate: -2 }}
						animate={{ opacity: 1, y: 0, rotate: -2 }}
						transition={{ duration: 0.6, delay: 0.15 }}
						src="/images/home/2.webp"
						alt={t("homeHero.imageAltOne")}
						className="h-48 w-full rounded-2xl object-cover shadow-lg sm:h-56 lg:h-64"
					/>
					<motion.img
						initial={{ opacity: 0, y: 25, rotate: 2 }}
						animate={{ opacity: 1, y: 0, rotate: 2 }}
						transition={{ duration: 0.65, delay: 0.2 }}
						src="/images/home/3.webp"
						alt={t("homeHero.imageAltTwo")}
						className="mt-10 h-52 w-full rounded-2xl object-cover shadow-lg sm:h-60 lg:h-72"
					/>
				</div>
			</div>
		</section>
	);
};

export default HomeHero;

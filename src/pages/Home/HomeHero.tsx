import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import QuickBookWidget from "./QuickBookWidget";

const HomeHero = () => {
	const { t } = useTranslation();

	return (
		<section className="relative isolate overflow-hidden rounded-3xl border border-slate-300/70 bg-gradient-to-br from-white to-slate-100 dark:border-slate-700/80 dark:from-slate-900 dark:to-slate-950">
			<div className="absolute inset-0">
				<img src="/images/home/1.webp" alt="" className="h-full w-full object-cover opacity-30 dark:opacity-25" />
				<div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent" />
			</div>

			<div className="relative grid gap-6 px-5 py-10 sm:px-8 md:px-10 lg:grid-cols-[1.2fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-8 lg:py-16">
				{/* 1 — Widget: top-left on desktop, first on mobile */}

				<div className="space-y-4">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.45, delay: 0.2 }}
						className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300"
					>
						<Sparkles className="h-3.5 w-3.5" />
						{t("homeHero.badge")}
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="lg:col-start-1 lg:row-start-1"
					>
						<QuickBookWidget />
					</motion.div>
				</div>

				{/* 2 — Images: right column spanning both rows on desktop, second on mobile */}
				<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-start-2 lg:row-start-1 lg:row-span-2">
					<motion.img
						initial={{ opacity: 0, y: 20, rotate: -2 }}
						animate={{ opacity: 1, y: 0, rotate: -2 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						src="/images/home/2.webp"
						alt={t("homeHero.imageAltOne")}
						className="h-48 w-full rounded-2xl object-cover shadow-lg sm:h-56 lg:h-72"
					/>
					<motion.img
						initial={{ opacity: 0, y: 25, rotate: 2 }}
						animate={{ opacity: 1, y: 0, rotate: 2 }}
						transition={{ duration: 0.65, delay: 0.15 }}
						src="/images/home/3.webp"
						alt={t("homeHero.imageAltTwo")}
						className="mt-10 h-52 w-full rounded-2xl object-cover shadow-lg sm:h-60 lg:h-80"
					/>
				</div>

				{/* 3 — Text: bottom-left on desktop, third (below images) on mobile */}
				<div className="space-y-4 lg:col-start-1 lg:row-start-2">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.25 }}
						className="max-w-2xl text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-50"
					>
						{t("homeHero.title")}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.3 }}
						className="max-w-xl text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300"
					>
						{t("homeHero.subtitle")}
					</motion.p>
				</div>
			</div>
		</section>
	);
};

export default HomeHero;

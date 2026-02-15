import { motion } from "framer-motion";
import { Award, HeartHandshake, Scissors, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

interface AboutPageProps {
	preview?: boolean;
}

const AboutPage = ({ preview = false }: AboutPageProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	const values = [
		{ key: "precision", icon: Scissors },
		{ key: "hospitality", icon: HeartHandshake },
		{ key: "hygiene", icon: ShieldCheck },
		{ key: "craft", icon: Award },
	] as const;

	const team = [
		{ id: "jamshid-1", key: "jamshid", image: "/images/barbers/1.webp" },
		{ id: "sardor-1", key: "sardor", image: "/images/barbers/2.webp" },
		{ id: "aziz-1", key: "aziz", image: "/images/barbers/3.webp" },
		{ id: "jamshid-2", key: "jamshid", image: "/images/barbers/4.webp" },
		{ id: "sardor-2", key: "sardor", image: "/images/barbers/5.webp" },
		{ id: "aziz-2", key: "aziz", image: "/images/barbers/6.webp" },
	] as const;

	const visibleTeam = preview ? team.slice(0, 2) : team;

	const sectionContent = (
		<section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6 lg:p-8 dark:border-slate-700 dark:bg-slate-900/70">
			<div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
				<div className="space-y-5">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">{t("aboutSection.eyebrow")}</p>
						<h2 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-slate-50">{t("aboutSection.title")}</h2>
						<p className="text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">{t("aboutSection.description")}</p>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 14 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60"
					>
						<h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("aboutSection.storyTitle")}</h3>
						<p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{t("aboutSection.storyText")}</p>
					</motion.div>

					<div className="grid gap-3 sm:grid-cols-2">
						{values.map((value, index) => {
							const Icon = value.icon;

							return (
								<motion.div
									key={value.key}
									initial={{ opacity: 0, y: 12 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, amount: 0.3 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className="rounded-xl border border-slate-300/70 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
								>
									<div className="flex items-start gap-2">
										<span className="rounded-lg bg-emerald-500/15 p-2 text-emerald-700 dark:text-emerald-300">
											<Icon className="h-4 w-4" />
										</span>
										<div>
											<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t(`aboutSection.values.${value.key}.title`)}</h4>
											<p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-400">{t(`aboutSection.values.${value.key}.text`)}</p>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{t("aboutSection.teamTitle")}</h3>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
						{visibleTeam.map((member, index) => (
							<motion.article
								key={member.id}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.3 }}
								transition={{ duration: 0.35, delay: index * 0.06 }}
								className="overflow-hidden rounded-2xl border border-slate-300/70 bg-white dark:border-slate-700 dark:bg-slate-900"
							>
								<div className="bg-slate-100 p-2 dark:bg-slate-950/60">
									<img
										src={member.image}
										alt={t(`aboutSection.team.${member.key}.name`)}
										className="h-72 w-full rounded-xl object-contain sm:h-80"
									/>
								</div>
								<div className="space-y-1 p-3">
									<h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t(`aboutSection.team.${member.key}.name`)}</h4>
									<p className="text-xs uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">{t(`aboutSection.team.${member.key}.role`)}</p>
									<p className="text-xs leading-6 text-slate-600 dark:text-slate-400">{t(`aboutSection.team.${member.key}.bio`)}</p>
								</div>
							</motion.article>
						))}
					</div>
				</div>
			</div>

			{preview && (
				<div className="mt-5 flex justify-end">
					<Link
						to={`/${locale}/about`}
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-slate-400"
					>
						{t("common.more")}
					</Link>
				</div>
			)}

			{!preview && (
				<div className="mt-8 grid gap-4 lg:grid-cols-3">
					<div className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
						<p className="text-2xl font-black text-slate-900 dark:text-slate-100">2014</p>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("aboutSection.extras.timelineOne")}</p>
					</div>
					<div className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
						<p className="text-2xl font-black text-slate-900 dark:text-slate-100">2019</p>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("aboutSection.extras.timelineTwo")}</p>
					</div>
					<div className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
						<p className="text-2xl font-black text-slate-900 dark:text-slate-100">Today</p>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("aboutSection.extras.timelineThree")}</p>
					</div>
				</div>
			)}
		</section>
	);

	if (preview) {
		return sectionContent;
	}

	return (
		<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-6xl">{sectionContent}</div>
		</main>
	);
};

export default AboutPage;

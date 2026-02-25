import { motion } from "framer-motion";
import { ArrowUpRight, Scissors, Sparkles, ShieldCheck, Clock3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ComponentType } from "react";

interface ServicePageProps {
	preview?: boolean;
}

type ServiceKey = "classicCut" | "beardStyling" | "skinFade" | "fatherSon" | "deluxePackage" | "hairColor";

const ServicePage = ({ preview = false }: ServicePageProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	const services: Array<{
		key: ServiceKey;
		image: string;
		icon: ComponentType<{ className?: string }>;
	}> = [
		{ key: "classicCut", image: "/images/services/1.webp", icon: Scissors },
		{ key: "beardStyling", image: "/images/services/2.webp", icon: ShieldCheck },
		{ key: "skinFade", image: "/images/services/3.webp", icon: Sparkles },
		{ key: "fatherSon", image: "/images/services/4.webp", icon: Scissors },
		{ key: "deluxePackage", image: "/images/services/5.webp", icon: Sparkles },
		{ key: "hairColor", image: "/images/services/6.webp", icon: ShieldCheck },
	];

	// TODO: Ushbu qismda ma'lumotlar bilan ishlashim kerak

	const visibleServices = preview ? services.slice(0, 4) : services;

	const sectionContent = (
		<section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6 lg:p-8 dark:border-slate-700 dark:bg-slate-900/70">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-2xl space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
						{t("servicesSection.eyebrow")}
					</p>
					<h2 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-slate-50">
						{t("servicesSection.title")}
					</h2>
					<p className="text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">
						{t("servicesSection.description")}
					</p>
				</div>
				<Link
					to={`/${locale}/booking`}
					className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-slate-400"
				>
					{t("servicesSection.bookNow")}
					<ArrowUpRight className="h-4 w-4" />
				</Link>
			</div>

			<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{visibleServices.map((service, index) => {
					const Icon = service.icon;

					return (
						<motion.article
							key={service.key}
							initial={{ opacity: 0, y: 14 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ duration: 0.35, delay: index * 0.06 }}
							className="group overflow-hidden rounded-2xl border border-slate-300/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
						>
							<div className="relative h-48 overflow-hidden">
								<img
									src={service.image}
									alt={t(`servicesSection.items.${service.key}.name`)}
									className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
								/>
								<div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-3">
									<div className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/30 px-2 py-1 text-xs text-white">
										<Clock3 className="h-3.5 w-3.5" />
										<span>{t(`servicesSection.items.${service.key}.duration`)}</span>
									</div>
									<p className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-slate-950">
										{t(`servicesSection.items.${service.key}.price`)}
									</p>
								</div>
							</div>
							<div className="space-y-2 p-4">
								<div className="flex items-center gap-2">
									<Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
									<h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
										{t(`servicesSection.items.${service.key}.name`)}
									</h3>
								</div>
								<p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
									{t(`servicesSection.items.${service.key}.description`)}
								</p>
							</div>
						</motion.article>
					);
				})}
			</div>

			{preview && (
				<div className="mt-5 flex justify-end">
					<Link
						to={`/${locale}/services`}
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
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{t("servicesSection.extras.processTitle")}
						</h3>
						<ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
							<li>1. {t("servicesSection.extras.processOne")}</li>
							<li>2. {t("servicesSection.extras.processTwo")}</li>
							<li>3. {t("servicesSection.extras.processThree")}</li>
						</ul>
					</div>

					<div className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{t("servicesSection.extras.popularTitle")}
						</h3>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("servicesSection.extras.popularText")}</p>
						<img
							src="/images/hairstyle/3.webp"
							alt={t("servicesSection.extras.popularTitle")}
							className="mt-3 h-40 w-full rounded-xl object-cover"
						/>
					</div>

					<div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 dark:bg-emerald-500/15">
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{t("servicesSection.extras.memberTitle")}
						</h3>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{t("servicesSection.extras.memberText")}</p>
						<Link
							to={`/${locale}/booking`}
							className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white dark:bg-slate-100 dark:text-slate-900"
						>
							{t("servicesSection.bookNow")}
						</Link>
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

export default ServicePage;

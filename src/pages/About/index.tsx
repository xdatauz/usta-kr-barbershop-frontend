import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, HeartHandshake, Scissors, ShieldCheck, TrendingUp, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { getBarbersApi, type BarberProfile } from "../../lib/api/barbers";

interface AboutPageProps {
	preview?: boolean;
}

const VALUES = [
	{ key: "precision", icon: Scissors, color: "from-blue-500 to-blue-600" },
	{ key: "hospitality", icon: HeartHandshake, color: "from-red-500 to-pink-600" },
	{ key: "hygiene", icon: ShieldCheck, color: "from-green-500 to-emerald-600" },
	{ key: "craft", icon: Award, color: "from-amber-500 to-orange-600" },
] as const;

const STATS = [
	{ icon: Users, value: "500+", label: "happy_clients" },
	{ icon: Scissors, value: "10K+", label: "haircuts" },
	{ icon: TrendingUp, value: "12y", label: "experience" },
	{ icon: Zap, value: "100%", label: "satisfaction" },
];

const TIMELINE = [
	{ year: "2014", key: "founded" },
	{ year: "2017", key: "expanded" },
	{ year: "2020", key: "modernized" },
	{ year: "2026", key: "leading" },
];

const BARBER_GRADIENTS = [
	"from-amber-400 via-orange-400 to-red-500",
	"from-blue-400 via-cyan-400 to-green-500",
	"from-purple-400 via-pink-400 to-red-500",
	"from-emerald-400 via-teal-400 to-cyan-500",
	"from-rose-400 via-pink-400 to-purple-500",
	"from-yellow-400 via-amber-400 to-orange-500",
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const AboutPage = ({ preview = false }: AboutPageProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	const [barbers, setBarbers] = useState<BarberProfile[]>([]);
	const [loadingBarbers, setLoadingBarbers] = useState(true);

	useEffect(() => {
		getBarbersApi()
			.then(setBarbers)
			.catch(() => setBarbers([]))
			.finally(() => setLoadingBarbers(false));
	}, []);

	const visibleBarbers = preview ? barbers.slice(0, 3) : barbers;

	return (
		<main className={preview ? "" : "w-full px-3 pt-32 pb-20 sm:px-5 lg:px-8"}>
			<div className={preview ? "" : "mx-auto max-w-7xl"}>
				<div
					className={
						preview
							? "rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6 lg:p-8 dark:border-slate-700 dark:bg-slate-900/70"
							: ""
					}
				>
					<section className="space-y-12 lg:space-y-16">
						{/* Hero */}
						<motion.div
							{...fadeUp}
							className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 dark:border-slate-700 dark:from-slate-900/50 dark:via-slate-900/30 dark:to-slate-950"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
								{t("aboutSection.eyebrow")}
							</p>
							<h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl dark:text-slate-50">
								{t("aboutSection.title")}
							</h1>
							<p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
								{t("aboutSection.description")}
							</p>
						</motion.div>

						{/* Story */}
						<motion.div
							{...fadeUp}
							className="rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 dark:border-emerald-900/50 dark:from-emerald-950/20 dark:to-teal-950/20"
						>
							<h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t("aboutSection.storyTitle")}</h2>
							<p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300">
								{t("aboutSection.storyText")}
							</p>
						</motion.div>

						{/* Stats */}
						{!preview && (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{STATS.map(({ icon: Icon, value, label }, i) => (
									<motion.div
										key={label}
										{...fadeUp}
										transition={{ delay: i * 0.07 }}
										className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/40"
									>
										<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 opacity-0 transition group-hover:from-emerald-500/10 group-hover:to-emerald-500/5 group-hover:opacity-100" />
										<div className="relative space-y-3">
											<div className="inline-flex rounded-lg bg-emerald-100 p-3 dark:bg-emerald-950/40">
												<Icon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
											</div>
											<div>
												<p className="text-3xl font-black text-slate-900 dark:text-slate-100">{value}</p>
												<p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
													{t(`aboutSection.stats.${label}`)}
												</p>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						)}

						{/* Values */}
						<div className="space-y-4">
							<h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
								{t("aboutSection.valuesTitle")}
							</h2>
							<div className="grid gap-4 sm:grid-cols-2">
								{VALUES.map(({ key, icon: Icon, color }, i) => (
									<motion.div
										key={key}
										{...fadeUp}
										transition={{ delay: i * 0.06 }}
										className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-emerald-700"
									>
										<div
											className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition duration-300 group-hover:opacity-5`}
										/>
										<div className="relative space-y-4">
											<div
												className={`inline-flex rounded-xl bg-gradient-to-br ${color} p-3 shadow-lg transition duration-300 group-hover:scale-110`}
											>
												<Icon className="h-6 w-6 text-white" />
											</div>
											<div>
												<h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
													{t(`aboutSection.values.${key}.title`)}
												</h4>
												<p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
													{t(`aboutSection.values.${key}.text`)}
												</p>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>

						{/* Timeline */}
						{!preview && (
							<div className="space-y-8">
								<h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
									{t("aboutSection.timelineTitle")}
								</h2>
								<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
									{TIMELINE.map(({ year, key }, i) => (
										<motion.div
											key={year}
											{...fadeUp}
											transition={{ delay: i * 0.1 }}
											className="flex flex-col items-center text-center"
										>
											<div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 shadow dark:bg-emerald-950/40">
												<span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
													{year.slice(-2)}
												</span>
											</div>
											<p className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">{year}</p>
											<p className="mt-1 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
												{t(`aboutSection.timeline.${key}`)}
											</p>
										</motion.div>
									))}
								</div>
							</div>
						)}

						{/* Team */}
						<div className="space-y-6">
							<h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t("aboutSection.teamTitle")}</h2>

							{loadingBarbers ? (
								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{[0, 1, 2].map((i) => (
										<div key={i} className="animate-pulse rounded-2xl">
											<div className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800" />
											<div className="mt-4 space-y-2">
												<div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
												<div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
												<div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
											</div>
										</div>
									))}
								</div>
							) : visibleBarbers.length === 0 ? null : (
								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{visibleBarbers.map((barber, i) => {
										const gradient = BARBER_GRADIENTS[i % BARBER_GRADIENTS.length];
										return (
											<motion.div key={barber.id} {...fadeUp} transition={{ delay: i * 0.08 }} className="group">
												<Link to={`/${locale}/barbers/${barber.id}`} className="block">
													<div className="relative overflow-hidden rounded-2xl">
														{barber.image ? (
															<img
																src={barber.image}
																alt={barber.name}
																className="aspect-square w-full object-cover shadow-lg transition duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]"
															/>
														) : (
															<div
																className={`aspect-square bg-gradient-to-br ${gradient} relative flex items-center justify-center shadow-lg transition duration-300 group-hover:shadow-2xl`}
															>
																<div className="text-center">
																	<div className="inline-flex rounded-full bg-white/20 p-4 backdrop-blur-sm">
																		<Scissors className="h-8 w-8 text-white opacity-80" />
																	</div>
																	<p className="mt-3 text-sm font-bold uppercase tracking-wider text-white">
																		{barber.name}
																	</p>
																</div>
															</div>
														)}
													</div>

													<div className="mt-4 space-y-1">
														<h3 className="text-lg font-bold text-slate-900 transition group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">
															{barber.name}
														</h3>
														{barber.role && (
															<p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
																{barber.role}
															</p>
														)}
														{barber.bio && (
															<p className="text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-2">
																{barber.bio}
															</p>
														)}
													</div>
												</Link>
											</motion.div>
										);
									})}
								</div>
							)}
						</div>

						{/* CTA */}
						<motion.div
							{...fadeUp}
							className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 shadow-xl md:p-12"
						>
							<div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10" />
							<div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-white/5" />

							<div className="relative space-y-6">
								<div>
									<h3 className="text-3xl font-black text-white md:text-4xl">{t("aboutSection.ctaTitle")}</h3>
									<p className="mt-2 text-lg text-emerald-100">{t("aboutSection.ctaDescription")}</p>
								</div>
								{preview ? (
									<Link
										to={`/${locale}/about`}
										onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
										className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:border-white/50 hover:bg-white/20"
									>
										{t("common.more")}
									</Link>
								) : (
									<Link
										to={`/${locale}/booking`}
										className="inline-flex items-center rounded-xl bg-white px-6 py-3 font-semibold text-emerald-600 transition hover:bg-slate-100"
									>
										{t("aboutSection.ctaButton")}
									</Link>
								)}
							</div>
						</motion.div>
					</section>
				</div>
			</div>
		</main>
	);
};

export default AboutPage;

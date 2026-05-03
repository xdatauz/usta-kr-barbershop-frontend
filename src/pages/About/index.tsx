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
	{ key: "precision", icon: Scissors },
	{ key: "hospitality", icon: HeartHandshake },
	{ key: "hygiene", icon: ShieldCheck },
	{ key: "craft", icon: Award },
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

// One Emerald Rule: a missing photo is a neutral placeholder, not a rainbow.

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
							? "rounded-3xl border border-border bg-card p-4 sm:p-6 lg:p-8"
							: ""
					}
				>
					<section className="space-y-12 lg:space-y-16">
						{/* Hero */}
						<motion.div
							{...fadeUp}
							className="rounded-3xl border border-border bg-card p-8"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.17em] text-primary">
								{t("aboutSection.eyebrow")}
							</p>
							<h1 className="mt-3 text-4xl font-black leading-tight text-foreground md:text-5xl">
								{t("aboutSection.title")}
							</h1>
							<p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
								{t("aboutSection.description")}
							</p>
						</motion.div>

						{/* Story */}
						<motion.div
							{...fadeUp}
							className="rounded-3xl border border-primary/20 bg-primary-light p-8"
						>
							<h2 className="text-2xl font-black text-foreground">{t("aboutSection.storyTitle")}</h2>
							<p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
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
										className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
									>
										<div className="space-y-3">
											<div className="inline-flex rounded-lg bg-primary-light p-3">
												<Icon className="h-6 w-6 text-primary" />
											</div>
											<div>
												<p className="text-3xl font-black text-foreground">{value}</p>
												<p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
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
							<h2 className="text-2xl font-black text-foreground">
								{t("aboutSection.valuesTitle")}
							</h2>
							<div className="grid gap-4 sm:grid-cols-2">
								{VALUES.map(({ key, icon: Icon }, i) => (
									<motion.div
										key={key}
										{...fadeUp}
										transition={{ delay: i * 0.06 }}
										className="rounded-2xl border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40"
									>
										<div className="space-y-4">
											<div className="inline-flex rounded-xl bg-primary-light p-3">
												<Icon className="h-6 w-6 text-primary" />
											</div>
											<div>
												<h4 className="text-lg font-bold text-foreground">
													{t(`aboutSection.values.${key}.title`)}
												</h4>
												<p className="mt-2 text-sm leading-6 text-muted-foreground">
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
								<h2 className="text-2xl font-black text-foreground">
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
											<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
												<span className="text-lg font-black text-primary">
													{year.slice(-2)}
												</span>
											</div>
											<p className="mt-3 text-sm font-bold text-foreground">{year}</p>
											<p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
												{t(`aboutSection.timeline.${key}`)}
											</p>
										</motion.div>
									))}
								</div>
							</div>
						)}

						{/* Team */}
						<div className="space-y-6">
							<h2 className="text-2xl font-black text-foreground">{t("aboutSection.teamTitle")}</h2>

							{loadingBarbers ? (
								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{[0, 1, 2].map((i) => (
										<div key={i} className="animate-pulse rounded-2xl">
											<div className="aspect-square rounded-2xl bg-muted" />
											<div className="mt-4 space-y-2">
												<div className="h-4 w-1/2 rounded bg-muted" />
												<div className="h-3 w-1/3 rounded bg-muted" />
												<div className="h-3 w-full rounded bg-muted" />
											</div>
										</div>
									))}
								</div>
							) : visibleBarbers.length === 0 ? null : (
								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{visibleBarbers.map((barber, i) => {
										return (
											<motion.div key={barber.id} {...fadeUp} transition={{ delay: i * 0.08 }} className="group">
												<Link to={`/${locale}/barbers/${barber.id}`} className="block">
													<div className="relative overflow-hidden rounded-2xl">
														{barber.image ? (
															<img
																src={barber.image}
																alt={barber.name}
																className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
															/>
														) : (
															<div className="aspect-square bg-muted relative flex items-center justify-center">
																<div className="text-center">
																	<div className="inline-flex rounded-full bg-primary-light p-4">
																		<Scissors className="h-8 w-8 text-primary" />
																	</div>
																	<p className="mt-3 text-sm font-bold uppercase tracking-wider text-foreground">
																		{barber.name}
																	</p>
																</div>
															</div>
														)}
													</div>

													<div className="mt-4 space-y-1">
														<h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
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
							className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12"
						>
							<div className="relative space-y-6">
								<div>
									<h3 className="text-3xl font-black text-primary-foreground md:text-4xl">{t("aboutSection.ctaTitle")}</h3>
									<p className="mt-2 text-lg text-primary-foreground/90">{t("aboutSection.ctaDescription")}</p>
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

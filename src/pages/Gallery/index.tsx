import { motion } from "framer-motion";
import { Camera, Expand } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

interface GalleryPageProps {
	preview?: boolean;
}

const galleryImages = [
	{ src: "/images/gallery/1.webp", category: "cuts" },
	{ src: "/images/gallery/4.webp", category: "interior" },
	{ src: "/images/gallery/7.webp", category: "barbers" },
	{ src: "/images/gallery/10.webp", category: "atmosphere" },
	{ src: "/images/gallery/13.webp", category: "cuts" },
	{ src: "/images/gallery/16.webp", category: "barbers" },
	{ src: "/images/gallery/19.webp", category: "interior" },
	{ src: "/images/gallery/22.webp", category: "atmosphere" },
	{ src: "/images/gallery/25.webp", category: "cuts" },
	{ src: "/images/barbershop/1.webp", category: "interior" },
	{ src: "/images/barbershop/2.webp", category: "interior" },
	{ src: "/images/barbershop/3.webp", category: "atmosphere" },
];

const GalleryPage = ({ preview = false }: GalleryPageProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
	const visibleImages = preview ? galleryImages.slice(0, 8) : galleryImages;

	const sectionContent = (
		<section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6 lg:p-8 dark:border-slate-700 dark:bg-slate-900/70">
			<div className="max-w-2xl space-y-2">
				<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">{t("gallerySection.eyebrow")}</p>
				<h2 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-slate-50">{t("gallerySection.title")}</h2>
				<p className="text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">{t("gallerySection.description")}</p>
			</div>

			<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				{visibleImages.map((image, index) => (
					<motion.figure
						key={`${image.src}-${index}`}
						initial={{ opacity: 0, y: 18 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.35, delay: index * 0.04 }}
						className={`group relative overflow-hidden rounded-2xl border border-slate-300/60 dark:border-slate-700 ${
							index % 5 === 0 ? "sm:col-span-2" : ""
						}`}
					>
						<img
							src={image.src}
							alt={t(`gallerySection.categories.${image.category}`)}
							className="h-40 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-52"
						/>
						<div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
							<div className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/30 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-white">
								<Camera className="h-3.5 w-3.5" />
								{t(`gallerySection.categories.${image.category}`)}
							</div>
							<span className="rounded-full bg-white/85 p-1.5 text-slate-900">
								<Expand className="h-3.5 w-3.5" />
							</span>
						</div>
					</motion.figure>
				))}
			</div>

			{preview && (
				<div className="mt-5 flex justify-end">
					<Link
						to={`/${locale}/gallery`}
						className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-slate-400"
					>
						{t("common.more")}
					</Link>
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

export default GalleryPage;

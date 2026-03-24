import { motion } from "framer-motion";
import { Camera, Expand, Instagram, RefreshCw, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useInstagramGallery } from "../../hooks/useInstagramGallery";

interface GalleryPageProps {
	preview?: boolean;
}

interface GalleryItem {
	src: string;
	category: string;
	caption?: string;
	permalink?: string;
	mediaType?: string;
	isInstagram?: boolean;
}

const hardcodedImages: GalleryItem[] = [
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
	{ src: "/images/gallery/2.webp", category: "cuts" },
	{ src: "/images/gallery/3.webp", category: "barbers" },
	{ src: "/images/gallery/5.webp", category: "interior" },
	{ src: "/images/gallery/6.webp", category: "atmosphere" },
];

const GalleryPage = ({ preview = false }: GalleryPageProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
	const { instagramMedia, loading: instagramLoading, error: instagramError, refresh } = useInstagramGallery(8);
	const [expandedImage, setExpandedImage] = useState<number | null>(null);
	const [openInstagramLink, setOpenInstagramLink] = useState<string | null>(null);

	// Combine hardcoded and Instagram images
	// Instagram images are shown first (more recent content)
	const combinedImages = [...instagramMedia, ...hardcodedImages];
	const visibleImages = preview ? combinedImages.slice(0, 8) : combinedImages;

	const sectionContent = (
		<section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6 lg:p-8 dark:border-slate-700 dark:bg-slate-900/70">
			<div className="flex items-start justify-between">
				<div className="max-w-2xl space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
						{t("gallerySection.eyebrow")}
					</p>
					<h2 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-slate-50">
						{t("gallerySection.title")}
					</h2>
					<p className="text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">
						{t("gallerySection.description")}
					</p>
				</div>
				{!preview && (
					<button
						onClick={() => refresh()}
						disabled={instagramLoading}
						className="ml-4 rounded-lg border border-emerald-300 bg-emerald-50 p-2 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900"
						title={t("common.refresh") || "Refresh Instagram content"}
					>
						<RefreshCw
							className={`h-4 w-4 text-emerald-700 dark:text-emerald-300 ${instagramLoading ? "animate-spin" : ""}`}
						/>
					</button>
				)}
			</div>

			{/* Instagram Error Message */}
			{instagramError && !preview && (
				<div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
					<AlertCircle className="h-4 w-4 flex-shrink-0" />
					<span>{t("gallerySection.instagramError") || "Could not load Instagram content. Showing gallery only."}</span>
				</div>
			)}

			{/* Instagram Loading State */}
			{instagramLoading && !preview && instagramMedia.length === 0 && (
				<div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
					<span>{t("gallerySection.loadingInstagram") || "Loading Instagram content..."}</span>
				</div>
			)}

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
						onMouseEnter={() => setExpandedImage(index)}
						onMouseLeave={() => setExpandedImage(null)}
					>
						<img
							src={image.src}
							alt={image.caption || t(`gallerySection.categories.${image.category}`)}
							className="h-40 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-52"
							onError={(e) => {
								// Fallback for broken images
								const target = e.target as HTMLImageElement;
								target.src = "/images/gallery/1.webp";
							}}
						/>

						{/* Video badge for Instagram reels */}
						{image.mediaType === "VIDEO" && (
							<div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
								🎬 Reel
							</div>
						)}

						{/* Overlay */}
						<div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
							<div className="inline-flex flex-col gap-1">
								{image.isInstagram && (
									<a
										href={image.permalink}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/30 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-white transition hover:bg-black/50"
										onClick={(e) => e.stopPropagation()}
									>
										<Instagram className="h-3 w-3" />
										Instagram
									</a>
								)}
								<div className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/30 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-white">
									<Camera className="h-3.5 w-3.5" />
									{image.caption
										? image.caption.substring(0, 20) + "..."
										: t(`gallerySection.categories.${image.category}`)}
								</div>
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
						<p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
							{t("gallerySection.extras.noteLabel")}
						</p>
						<h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
							{t("gallerySection.extras.noteTitle")}
						</h3>
						<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("gallerySection.extras.noteText")}</p>
					</div>
					<div className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{t("gallerySection.extras.stylesTitle")}
						</h3>
						<ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
							<li>• {t("gallerySection.extras.styleOne")}</li>
							<li>• {t("gallerySection.extras.styleTwo")}</li>
							<li>• {t("gallerySection.extras.styleThree")}</li>
							<li>• {t("gallerySection.extras.styleFour")}</li>
						</ul>
					</div>
					<div className="overflow-hidden rounded-2xl border border-slate-300/70 dark:border-slate-700">
						<img
							src="/images/gallery/24.webp"
							alt={t("gallerySection.title")}
							className="h-full min-h-44 w-full object-cover"
						/>
					</div>
				</div>
			)}
		</section>
	);

	if (preview) {
		return sectionContent;
	}

	return (
		<main className="w-full px-3 pb-14 p-32 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-7xl">{sectionContent}</div>
		</main>
	);
};

export default GalleryPage;

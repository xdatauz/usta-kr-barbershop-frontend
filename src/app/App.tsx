import AppRouter from "./router";
import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../context/theme/theme-provider";

const SITE_URL = "https://ustabarber.pro";
const LOCALES = ["uz", "kr", "ru", "en"] as const;
const HREFLANG_MAP: Record<string, string> = { uz: "uz", kr: "ko", ru: "ru", en: "en" };

const PAGE_META_KEYS: Record<string, { title: string; description: string }> = {
	services: { title: "meta.servicesTitle", description: "meta.servicesDescription" },
	booking: { title: "meta.bookingTitle", description: "meta.bookingDescription" },
	barbers: { title: "meta.barbersTitle", description: "meta.barbersDescription" },
	gallery: { title: "meta.galleryTitle", description: "meta.galleryDescription" },
	about: { title: "meta.aboutTitle", description: "meta.aboutDescription" },
	contact: { title: "meta.contactTitle", description: "meta.contactDescription" },
	articles: { title: "meta.articlesTitle", description: "meta.articlesDescription" },
};

function usePageSeo() {
	const { t, i18n } = useTranslation();
	const { pathname } = useLocation();

	return useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		const locale = segments[0] || "uz";
		const page = segments[1] || "";
		const meta = PAGE_META_KEYS[page];

		const title = meta ? t(meta.title) : t("meta.title");
		const description = meta ? t(meta.description) : t("meta.description");
		const lang = i18n.resolvedLanguage || "uz";
		const canonical = `${SITE_URL}${pathname}`;
		const pathSuffix = page ? `/${page}` : "";

		return { title, description, lang, canonical, locale, page, pathSuffix };
	}, [pathname, t, i18n.resolvedLanguage]);
}

function buildJsonLd(lang: string) {
	const isKo = lang === "kr" || lang === "ko";
	return {
		"@context": "https://schema.org",
		"@type": "BarberShop",
		"name": "Usta Barber",
		"alternateName": isKo ? "우스타 바버샵" : "Usta Sartaroshxona",
		"url": SITE_URL,
		"logo": `${SITE_URL}/logos/main-logo.jpg`,
		"image": `${SITE_URL}/images/home/1.webp`,
		"description": isKo
			? "한국에서 운영하는 우즈벡 프리미엄 바버샵. 현대적 헤어컷, 수염 스타일링, 스킨 페이드."
			: "Koreyadagi o'zbek premium sartaroshxonasi. Zamonaviy soch turmagi, soqol parvarishi, skin fade.",
		"priceRange": "₩₩",
		"currenciesAccepted": "KRW, UZS",
		"paymentAccepted": "Cash, Credit Card",
		"openingHoursSpecification": [
			{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], "opens": "09:00", "closes": "21:00" },
			{ "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "10:00", "closes": "18:00" }
		],
		"hasOfferCatalog": {
			"@type": "OfferCatalog",
			"name": isKo ? "바버 서비스" : "Barber xizmatlari",
			"itemListElement": [
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": isKo ? "클래식 헤어컷" : "Klassik soch olish" } },
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": isKo ? "스킨 페이드" : "Skin fade" } },
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": isKo ? "수염 스타일링" : "Soqol shakllantirish" } },
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": isKo ? "디럭스 그루밍" : "Deluxe parvarish" } }
			]
		},
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "둥지로 84-1",
			"addressLocality": "경산시",
			"addressRegion": "경상북도",
			"addressCountry": "KR"
		},
		"telephone": "+82-53-813-5515",
		"sameAs": []
	};
}

export default function App() {
	const { t, i18n } = useTranslation();
	const location = useLocation();
	const [scrolled, setScrolled] = useState(false);
	const seo = usePageSeo();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, [location.pathname]);

	const jsonLd = useMemo(() => buildJsonLd(seo.lang), [seo.lang]);

	return (
		<>
			<Helmet key={`${i18n.resolvedLanguage}-${seo.page}`}>
				<html lang={HREFLANG_MAP[seo.lang] || "uz"} />
				<title>{seo.title}</title>
				<meta name="description" content={seo.description} />
				<meta name="keywords" content={t("meta.keywords")} />

				{/* Canonical */}
				<link rel="canonical" href={seo.canonical} />

				{/* Hreflang alternates */}
				{LOCALES.map((loc) => (
					<link key={loc} rel="alternate" hrefLang={HREFLANG_MAP[loc]} href={`${SITE_URL}/${loc}${seo.pathSuffix}`} />
				))}
				<link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/uz${seo.pathSuffix}`} />

				{/* Open Graph */}
				<meta property="og:title" content={seo.title} />
				<meta property="og:description" content={seo.description} />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={seo.canonical} />
				<meta property="og:image" content={`${SITE_URL}/logos/main-logo.jpg`} />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:site_name" content="Usta Barber" />
				<meta property="og:locale" content={HREFLANG_MAP[seo.lang] || "uz"} />

				{/* Twitter Card */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={seo.title} />
				<meta name="twitter:description" content={seo.description} />
				<meta name="twitter:image" content={`${SITE_URL}/logos/main-logo.jpg`} />

				{/* Geo targeting for Korea */}
				<meta name="geo.region" content="KR" />
				<meta name="geo.placename" content="South Korea" />

				{/* Naver verification (placeholder) */}
				{/* <meta name="naver-site-verification" content="YOUR_NAVER_CODE" /> */}

				{/* Additional SEO */}
				<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
				<meta name="author" content="Usta Barber" />
				<meta name="theme-color" content="#10b981" />

				{/* JSON-LD Structured Data */}
				<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
			</Helmet>

			<ThemeProvider>
				<div className="flex min-h-screen w-full flex-col items-center bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
					<div className="main-container">
						{/* HEADER */}
						<div className="flex space-y-2 flex-col mx-auto w-full justify-center items-center">
							<Navbar scrolled={scrolled} />
						</div>
						{/* MAIN CONTENT */}
						<ErrorBoundary>
							<motion.div
								className="w-full"
								initial={{ opacity: 0, scale: 0.95, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 20 }}
								transition={{ duration: 0.5, ease: "easeInOut" }}
							>
								<AppRouter />
							</motion.div>
						</ErrorBoundary>

						{/* FOOTER */}
						<div className="w-full border-t border-slate-300 dark:border-slate-800">
							<Footer />
						</div>
					</div>
					<ToastContainer position="top-right" autoClose={3500} closeOnClick pauseOnHover theme="colored" />
				</div>
			</ThemeProvider>
		</>
	);
}

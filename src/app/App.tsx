import AppRouter from "./router";
import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import ErrorBoundary from "../components/ErrorBoundary";
import { CONTACT } from "../constants/contact";

const SITE_URL = CONTACT.siteUrl;
const LOCALES = ["uz", "kr", "ru", "en"] as const;
const HREFLANG_MAP: Record<string, string> = { uz: "uz", kr: "ko", ru: "ru", en: "en" };
const OG_LOCALE_MAP: Record<string, string> = {
	uz: "uz_UZ",
	ko: "ko_KR",
	ru: "ru_RU",
	en: "en_US",
};

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
		const hreflangLocale = HREFLANG_MAP[lang] || "uz";
		const ogLocale = OG_LOCALE_MAP[hreflangLocale] || "uz_UZ";

		return { title, description, lang, canonical, locale, page, pathSuffix, hreflangLocale, ogLocale, segments };
	}, [pathname, t, i18n.resolvedLanguage]);
}

function buildJsonLd(lang: string) {
	const isKo = lang === "kr" || lang === "ko";
	return {
		"@context": "https://schema.org",
		"@type": "BarberShop",
		"@id": `${SITE_URL}/#organization`,
		"name": CONTACT.siteName,
		"alternateName": isKo ? "우스타 바버샵" : "Usta Sartaroshxona",
		"url": SITE_URL,
		"logo": `${SITE_URL}/logos/main-logo.jpg`,
		"image": [
			`${SITE_URL}/logos/main-logo.jpg`,
			`${SITE_URL}/images/home/1.webp`,
		],
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
			"streetAddress": CONTACT.address.street,
			"addressLocality": CONTACT.address.city,
			"addressRegion": CONTACT.address.region,
			"addressCountry": CONTACT.address.country
		},
		// TODO: aniq koordinatalar bilan yangilash — hozir 경산시 taxminiy markaz
		"geo": {
			"@type": "GeoCoordinates",
			"latitude": CONTACT.geo.latitude,
			"longitude": CONTACT.geo.longitude
		},
		"telephone": CONTACT.phones[0].tel,
		"sameAs": [CONTACT.instagram, CONTACT.telegram]
	};
}

function buildBreadcrumbJsonLd(segments: string[], t: (key: string) => string) {
	if (segments.length === 0) return null;

	const items = segments.map((seg, i) => {
		const isLocale = i === 0;
		const navKey = `nav.${seg}`;
		const translated = t(navKey);
		const name = isLocale ? seg.toUpperCase() : translated !== navKey ? translated : seg;
		return {
			"@type": "ListItem",
			"position": i + 1,
			"name": name,
			"item": `${SITE_URL}/${segments.slice(0, i + 1).join("/")}`,
		};
	});

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": items,
	};
}

export default function App() {
	const { t, i18n } = useTranslation();
	const location = useLocation();
	const [scrolled, setScrolled] = useState(false);
	const seo = usePageSeo();

	useEffect(() => {
		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					setScrolled(window.scrollY > 20);
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, [location.pathname]);

	const jsonLd = useMemo(() => buildJsonLd(seo.lang), [seo.lang]);
	const breadcrumbJsonLd = useMemo(
		() => buildBreadcrumbJsonLd(seo.segments, t),
		[seo.segments, t],
	);

	const naverVerification = import.meta.env.VITE_NAVER_VERIFICATION;

	return (
		<LazyMotion features={domAnimation}>
			<Helmet key={`${i18n.resolvedLanguage}-${seo.page}`}>
				<html lang={HREFLANG_MAP[seo.lang] || "uz"} />
				<title>{seo.title}</title>
				<meta name="description" content={seo.description} />

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
				<meta property="og:site_name" content={CONTACT.siteName} />
				<meta property="og:locale" content={seo.ogLocale} />
				{LOCALES.filter((loc) => HREFLANG_MAP[loc] !== seo.hreflangLocale).map((loc) => (
					<meta
						key={`og-alt-${loc}`}
						property="og:locale:alternate"
						content={OG_LOCALE_MAP[HREFLANG_MAP[loc]]}
					/>
				))}

				{/* Twitter Card */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={seo.title} />
				<meta name="twitter:description" content={seo.description} />
				<meta name="twitter:image" content={`${SITE_URL}/logos/main-logo.jpg`} />

				{/* Geo targeting for Korea */}
				<meta name="geo.region" content="KR" />
				<meta name="geo.placename" content="South Korea" />

				{/* Naver verification — configured via VITE_NAVER_VERIFICATION env var.
				    Real code should be obtained from Naver Webmaster Tools. */}
				{naverVerification && (
					<meta name="naver-site-verification" content={naverVerification} />
				)}

				{/* Additional SEO */}
				<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
				<meta name="author" content={CONTACT.siteName} />
				<meta name="theme-color" content="#10b981" />

				{/* JSON-LD Structured Data */}
				<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
				{breadcrumbJsonLd && (
					<script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
				)}
			</Helmet>

			<div className="flex min-h-screen w-full flex-col items-center bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
				<div className="main-container">
					{/* HEADER */}
					<div className="flex space-y-2 flex-col mx-auto w-full justify-center items-center">
						<Navbar scrolled={scrolled} />
					</div>
					{/* MAIN CONTENT */}
					<ErrorBoundary>
						<m.div
							className="w-full"
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.5, ease: "easeInOut" }}
						>
							<AppRouter />
						</m.div>
					</ErrorBoundary>

					{/* FOOTER */}
					<div className="w-full border-t border-slate-300 dark:border-slate-800">
						<Footer />
					</div>
				</div>
				<ToastContainer
					position="top-right"
					autoClose={3500}
					closeOnClick
					pauseOnHover
					theme="colored"
					role="status"
					aria-live="polite"
				/>
			</div>
		</LazyMotion>
	);
}

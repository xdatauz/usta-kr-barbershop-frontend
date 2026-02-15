import AppRouter from "./router";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { ThemeProvider } from "../context/theme/theme-provider";

export default function App() {
	const { t, i18n } = useTranslation();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<>
			<Helmet key={i18n.resolvedLanguage}>
				<html lang={i18n.resolvedLanguage || "uz"} />
				<title>{t("meta.title", { defaultValue: "Usta | Premium Barber Shop" })}</title>
				<meta
					name="description"
					content={t("meta.description", {
						defaultValue:
							"Usta Premium Barber Shop offers modern haircuts, beard styling, and professional grooming services. Experience sharp style and quality service.",
					})}
				/>
				<meta property="og:title" content={t("meta.ogTitle", { defaultValue: "Usta | Premium Barber Shop" })} />
				<meta
					property="og:description"
					content={t("meta.ogDescription", {
						defaultValue: "Modern haircuts, beard trims, and professional grooming at Usta Premium Barber Shop.",
					})}
				/>
				<meta property="og:type" content="website" />
				<meta property="og:image" content="/preview.jpg" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={t("meta.ogTitle", { defaultValue: "Usta | Premium Barber Shop" })} />
				<meta
					name="twitter:description"
					content={t("meta.ogDescription", {
						defaultValue: "Modern haircuts, beard trims, and professional grooming at Usta Premium Barber Shop.",
					})}
				/>
			</Helmet>

			<ThemeProvider>
				<div className="flex min-h-screen w-full flex-col items-center bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
					<div className="main-container">
						{/* HEADER */}
						<div className="flex space-y-2 flex-col mx-auto w-full justify-center items-center">
							<Navbar scrolled={scrolled} />
						</div>
						{/* MAIN CONTENT */}
						<motion.div
							className="w-full"
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.5, ease: "easeInOut" }}
						>
							<AppRouter />
						</motion.div>

						{/* FOOTER */}
						<div className="w-full border-t border-slate-300 dark:border-slate-800">
							<Footer />
						</div>
					</div>
				</div>
			</ThemeProvider>
		</>
	);
}

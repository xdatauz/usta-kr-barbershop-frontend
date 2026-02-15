import AppRouter from "./router";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { ThemeProvider } from "../context/theme/theme-provider";

export default function App() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<>
			<Helmet>
				<title>Usta | Premium Barber Shop</title>
				<meta
					name="description"
					content="Usta Premium Barber Shop offers modern haircuts, beard styling, and professional grooming services. Experience sharp style and quality service."
				/>
				<meta property="og:title" content="Usta | Premium Barber Shop" />
				<meta
					property="og:description"
					content="Modern haircuts, beard trims, and professional grooming at Usta Premium Barber Shop."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:image" content="/preview.jpg" />
				<meta name="twitter:card" content="summary_large_image" />
			</Helmet>

			<ThemeProvider>
				<div className="bg-[#BFC9D1] dark:bg-gray-800 text-gray-900 dark:text-gray-100 space-y-10 flex flex-col justify-center items-center">
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
						<div className="w-full border-t border-neutral-400">
							<Footer />
						</div>
					</div>
				</div>
			</ThemeProvider>
		</>
	);
}

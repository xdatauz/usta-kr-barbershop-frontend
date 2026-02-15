import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

const withLayoutHome = <P extends object>(Component: React.ComponentType<P>) => {
	const WithLayout: React.FC<P> = (props) => {
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

				<div className="w-screen bg-[rgb(217,217,217)] flex flex-col items-center space-y-10">
					<div className="main-container w-full max-w-7xl mx-auto">
						<Navbar scrolled={scrolled} />

						<motion.div
							className="w-full"
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{ duration: 0.4 }}
						>
							<Component {...props} />
						</motion.div>

						<Footer />
					</div>
				</div>
			</>
		);
	};

	return WithLayout;
};

export default withLayoutHome;

// layouts/withLayoutBasic.tsx
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

const withLayoutBasic = <P extends object>(Component: React.ComponentType<P>) => {
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
				</Helmet>

				<div className="w-screen bg-[rgb(217,217,217)] flex flex-col items-center space-y-10">
					<div className="main-container w-full mx-auto">
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

export default withLayoutBasic;

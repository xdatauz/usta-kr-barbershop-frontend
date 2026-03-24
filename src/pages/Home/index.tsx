import { motion } from "framer-motion";
import AboutPage from "../About";
import ContactPage from "../Contact";
import GalleryPage from "../Gallery";
import ServicePage from "../Services";
import HomeHero from "./HomeHero";
import ArticlePage from "../Article";

const HomePage = () => {
	return (
		<main className="relative w-full px-3 pb-14 pt-32 sm:px-5 lg:px-8">
			<div className="mx-auto w-full max-w-7xl space-y-8">
				<HomeHero />

				<motion.div
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.35 }}
				>
					<ServicePage preview />
				</motion.div>
				{/* <motion.div
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.35 }}
				>
					<ArticlePage preview />
				</motion.div> */}
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.35 }}
				>
					<GalleryPage preview />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.35 }}
				>
					<AboutPage preview />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.35 }}
				>
					<ContactPage preview />
				</motion.div>
			</div>
		</main>
	);
};

export default HomePage;

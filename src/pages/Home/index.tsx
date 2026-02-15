import AboutPage from "../About";
import ContactPage from "../Contact";
import GalleryPage from "../Gallery";
import ServicePage from "../Services";
import HomeHero from "./HomeHero";

const HomePage = () => {
	return (
		<main className="w-full relative">
			<section className="relative h-screen flex flex-col justify-center items-center  px-6 text-center">
				<HomeHero />
			</section>
			<section className="relative h-screen flex flex-col justify-center items-center  px-6 text-center">
				<ServicePage />
			</section>
			<section className="relative h-screen flex flex-col justify-center items-center  px-6 text-center">
				<GalleryPage />
			</section>
			<section className="relative h-screen flex flex-col justify-center items-center  px-6 text-center">
				<AboutPage />
			</section>
			<section className="relative h-screen flex flex-col justify-center items-center  px-6 text-center">
				<ContactPage />
			</section>
		</main>
	);
};

export default HomePage;

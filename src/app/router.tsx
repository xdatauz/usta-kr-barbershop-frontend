import { Routes, Route } from "react-router-dom";
import withLayoutHome from "../layouts/withLayoutHome";

import HomePage from "../pages/Home";
import Services from "../pages/Services";
import GalleryPage from "../pages/Gallery";
import AboutPage from "../pages/About";
import ContactPage from "../pages/Contact";

const AppRouter = () => {
	const Home = withLayoutHome(HomePage);
	const ServicesPage = withLayoutHome(Services);
	const Gallery = withLayoutHome(GalleryPage);
	const About = withLayoutHome(AboutPage);
	const Contact = withLayoutHome(ContactPage);

	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/services" element={<ServicesPage />} />
			<Route path="/gallery" element={<Gallery />} />
			<Route path="/about" element={<About />} />
			<Route path="/contact" element={<Contact />} />
		</Routes>
	);
};

export default AppRouter;

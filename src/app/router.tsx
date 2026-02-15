import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/Home";
import ServicePage from "../pages/Services";
import GalleryPage from "../pages/Gallery";
import AboutPage from "../pages/About";
import ContactPage from "../pages/Contact";

const AppRouter = () => {
	return (
		<Routes>
			{/* Redirect root to default language */}
			<Route path="/" element={<Navigate to="/uz" replace />} />

			<Route path="/:locale">
				<Route index element={<HomePage />} />
				<Route path="services" element={<ServicePage />} />
				<Route path="gallery" element={<GalleryPage />} />
				<Route path="about" element={<AboutPage />} />
				<Route path="contact" element={<ContactPage />} />
			</Route>
		</Routes>
	);
};

export default AppRouter;

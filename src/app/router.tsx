import { Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import HomePage from "../pages/Home";
import ServicePage from "../pages/Services";
import GalleryPage from "../pages/Gallery";
import AboutPage from "../pages/About";
import ContactPage from "../pages/Contact";
import UserPage from "../pages/User";
import BookingPage from "../pages/Booking";
import BarbersPage from "../pages/Barbers";
import ArticlePage from "../pages/Article";
import NotificationsPage from "../pages/Notifications";

const supportedLocales = ["uz", "kr", "en", "ru"] as const;

const LocaleGuard = () => {
	const { locale } = useParams();

	if (!locale || !supportedLocales.includes(locale as (typeof supportedLocales)[number])) {
		return <Navigate to="/uz" replace />;
	}

	return <Outlet />;
};

const AppRouter = () => {
	return (
		<Routes>
			{/* Redirect root to default language */}
			<Route path="/" element={<Navigate to="/uz" replace />} />

			<Route path="/:locale" element={<LocaleGuard />}>
				<Route index element={<HomePage />} />
				<Route path="services" element={<ServicePage />} />
				<Route path="gallery" element={<GalleryPage />} />
				<Route path="about" element={<AboutPage />} />
				<Route path="contact" element={<ContactPage />} />
				<Route path="booking" element={<BookingPage />} />
				<Route path="articles" element={<ArticlePage />} />
				<Route path="barbers" element={<BarbersPage />} />
				<Route path="barbers/:barberId" element={<BarbersPage />} />
				<Route path="profile" element={<UserPage />} />
				<Route path="notifications" element={<NotificationsPage />} />
			</Route>

			<Route path="*" element={<Navigate to="/uz" replace />} />
		</Routes>
	);
};

export default AppRouter;

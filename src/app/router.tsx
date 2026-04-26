import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";

const HomePage = lazy(() => import("../pages/Home"));
const ServicePage = lazy(() => import("../pages/Services"));
const GalleryPage = lazy(() => import("../pages/Gallery"));
const AboutPage = lazy(() => import("../pages/About"));
const ContactPage = lazy(() => import("../pages/Contact"));
const UserPage = lazy(() => import("../pages/User"));
const BookingPage = lazy(() => import("../pages/Booking"));
const BarberListPage = lazy(() => import("../pages/Barbers/BarberListPage"));
const BarberProfilePage = lazy(() => import("../pages/Barbers/BarberProfilePage"));
const ArticlePage = lazy(() => import("../pages/Article"));
const NotificationsPage = lazy(() => import("../pages/Notifications"));

const supportedLocales = ["uz", "kr", "en", "ru"] as const;

const PageLoader = () => (
	<div className="flex min-h-[60vh] items-center justify-center">
		<div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500" />
	</div>
);

const LocaleGuard = () => {
	const { locale } = useParams();

	if (!locale || !supportedLocales.includes(locale as (typeof supportedLocales)[number])) {
		return <Navigate to="/uz" replace />;
	}

	return <Outlet />;
};

const AppRouter = () => {
	return (
		<Suspense fallback={<PageLoader />}>
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
					<Route path="barbers" element={<BarberListPage />} />
					<Route path="barbers/:barberId" element={<BarberProfilePage />} />
					<Route path="profile" element={<UserPage />} />
					<Route path="notifications" element={<NotificationsPage />} />
				</Route>

				<Route path="*" element={<Navigate to="/uz" replace />} />
			</Routes>
		</Suspense>
	);
};

export default AppRouter;

import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import BookingPage from "../pages/BookingPage";


export const AppRouter = () => {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/dashboard" element={<DashboardPage />} />
			<Route path="/booking" element={<BookingPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

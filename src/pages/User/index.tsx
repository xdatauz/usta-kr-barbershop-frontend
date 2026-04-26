import { useEffect, useMemo, useState } from "react";
import {
	CalendarDays,
	CalendarPlus,
	LogIn,
	UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth/auth-provider";
import { getMyBookingsApi, cancelMyBookingApi, type MyBooking } from "../../lib/api/bookings";
import { getBarbersApi, type BarberProfile } from "../../lib/api/barbers";
import { isApiError } from "../../lib/api/client";
import UserSidebar from "./UserSidebar";
import BookingCard from "./BookingCard";
import BookingDetailModal from "./BookingDetailModal";

type Tab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const UserPage = () => {
	const { t } = useTranslation();
	const { currentUser, logout } = useAuth();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	const [bookings, setBookings] = useState<MyBooking[]>([]);
	const [barbers, setBarbers] = useState<BarberProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [tab, setTab] = useState<Tab>("all");
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [cancellingId, setCancellingId] = useState<string | null>(null);
	const [detailBooking, setDetailBooking] = useState<MyBooking | null>(null);

	const loadBookings = () => {
		setLoading(true);
		getMyBookingsApi()
			.then(setBookings)
			.catch(() => setBookings([]))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		if (currentUser) loadBookings();
	}, [currentUser]);

	useEffect(() => {
		getBarbersApi()
			.then(setBarbers)
			.catch(() => setBarbers([]));
	}, []);

	const barberName = (id: string | null) => (id ? (barbers.find((b) => b.id === id)?.name ?? id) : "\u2014");

	const counts = useMemo(
		() => ({
			all: bookings.length,
			pending: bookings.filter((b) => b.status === "pending").length,
			confirmed: bookings.filter((b) => b.status === "confirmed").length,
			completed: bookings.filter((b) => b.status === "completed").length,
			cancelled: bookings.filter((b) => b.status === "cancelled").length,
		}),
		[bookings],
	);

	const visible = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

	const handleCancelConfirm = async (id: string) => {
		setConfirmId(null);
		setCancellingId(id);
		try {
			await cancelMyBookingApi(id);
			setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
			toast.success(t("toast.booking.cancelSuccess"));
		} catch (err) {
			toast.error(isApiError(err) && err.message ? err.message : t("toast.booking.cancelFailed"));
		} finally {
			setCancellingId(null);
		}
	};

	/* -- guest -- */
	if (!currentUser) {
		return (
			<main className="flex min-h-screen w-full items-center justify-center px-4 pt-20 pb-14">
				<div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
					<div className="h-1.5 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-emerald-600 dark:via-emerald-400 dark:to-emerald-600" />
					<div className="p-8 text-center">
						<div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 ring-4 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
							<UserRound className="h-9 w-9 text-slate-400 dark:text-slate-500" />
						</div>
						<h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{t("userPage.guestTitle")}</h1>
						<p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
							{t("userPage.guestDescription")}
						</p>
						<Link
							to={`/${locale}`}
							className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700 active:scale-95 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
						>
							<LogIn className="h-4 w-4" />
							{t("userPage.backHome")}
						</Link>
					</div>
				</div>
			</main>
		);
	}

	const tabs: { key: Tab; label: string; count: number }[] = [
		{ key: "all", label: t("userPage.tabs.all"), count: counts.all },
		{ key: "pending", label: t("userPage.tabs.pending"), count: counts.pending },
		{ key: "confirmed", label: t("userPage.tabs.confirmed"), count: counts.confirmed },
		{ key: "completed", label: t("userPage.tabs.completed"), count: counts.completed },
		{ key: "cancelled", label: t("userPage.tabs.cancelled"), count: counts.cancelled },
	];

	/* -- authenticated -- */
	return (
		<main className="min-h-screen w-full bg-slate-50 px-4 pb-20 pt-32 sm:px-6 lg:px-8 dark:bg-slate-950">
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
					{/* Sidebar */}
					<UserSidebar
						currentUser={{
							name: currentUser.name,
							phone: currentUser.phone,
							image: currentUser.image ?? null,
						}}
						locale={locale}
						counts={counts}
						onLogout={logout}
					/>

					{/* Main */}
					<div className="min-w-0 flex-1">
						<div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
							{/* header */}
							<div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
								<div>
									<h2 className="font-black text-slate-900 dark:text-slate-100">{t("userPage.bookingsTitle")}</h2>
									<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("userPage.subtitle")}</p>
								</div>
							</div>

							{/* tabs */}
							<div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 dark:border-slate-800">
								{tabs.map((t_) => (
									<button
										key={t_.key}
										type="button"
										onClick={() => setTab(t_.key)}
										className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
											tab === t_.key
												? "border-slate-900 text-slate-900 dark:border-emerald-400 dark:text-emerald-400"
												: "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
										}`}
									>
										{t_.label}
										{t_.count > 0 && (
											<span
												className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === t_.key ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}
											>
												{t_.count}
											</span>
										)}
									</button>
								))}
							</div>

							{/* content */}
							<div className="p-4">
								{loading ? (
									<div className="space-y-3">
										{[1, 2, 3].map((i) => (
											<div key={i} className="flex gap-3">
												<div className="w-1 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
												<div className="flex-1 animate-pulse space-y-2 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
													<div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
													<div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
												</div>
											</div>
										))}
									</div>
								) : visible.length === 0 ? (
									<div className="flex flex-col items-center py-14 text-center">
										<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
											<CalendarDays className="h-7 w-7 text-slate-400 dark:text-slate-500" />
										</div>
										<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
											{tab === "all"
												? t("userPage.bookingsEmpty")
												: t("userPage.bookingsEmptyFiltered", { tab: t(`userPage.tabs.${tab}`) })}
										</p>
										{tab === "all" && (
											<Link
												to={`/${locale}/booking`}
												className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 active:scale-95 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
											>
												<CalendarPlus className="h-4 w-4" />
												{t("nav.bookAppointment")}
											</Link>
										)}
									</div>
								) : (
									<div className="space-y-3">
										{visible.map((booking) => (
											<BookingCard
												key={booking.id}
												booking={booking}
												cancellingId={cancellingId}
												confirmId={confirmId}
												onViewDetail={setDetailBooking}
												onRequestCancel={setConfirmId}
												onConfirmCancel={handleCancelConfirm}
												onDismissCancel={() => setConfirmId(null)}
											/>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Detail modal */}
			{detailBooking && (
				<BookingDetailModal
					booking={detailBooking}
					barberName={barberName(detailBooking.barberId)}
					onClose={() => setDetailBooking(null)}
				/>
			)}
		</main>
	);
};

export default UserPage;

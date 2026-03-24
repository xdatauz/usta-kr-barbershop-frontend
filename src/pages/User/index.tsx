import { useEffect, useMemo, useState } from "react";
import {
	Phone,
	CalendarDays,
	Clock3,
	Scissors,
	RefreshCw,
	LogIn,
	CalendarPlus,
	UserRound,
	ChevronRight,
	Hash,
	XCircle,
	AlertTriangle,
	Info,
	X,
	User,
	ClockArrowUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth/auth-provider";
import { getMyBookingsApi, cancelMyBookingApi, type MyBooking } from "../../lib/api/bookings";
import { getBarbersApi, type BarberProfile } from "../../lib/api/barbers";
import { isApiError } from "../../lib/api/client";

const getInitials = (name: string) => {
	const parts = name.trim().split(/\s+/);
	return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
};

const STATUS_STYLE: Record<string, { badge: string; bar: string; label: string }> = {
	pending: {
		badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
		bar: "bg-amber-400",
		label: "Pending",
	},
	confirmed: {
		badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
		bar: "bg-blue-500",
		label: "Confirmed",
	},
	completed: {
		badge:
			"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
		bar: "bg-emerald-500",
		label: "Completed",
	},
	cancelled: {
		badge: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
		bar: "bg-red-400",
		label: "Cancelled",
	},
};

const statusStyle = (s: string) => STATUS_STYLE[s] ?? STATUS_STYLE.pending;

/** Can only cancel pending/confirmed bookings that are today or in the future */
const canCancel = (b: MyBooking): boolean => {
	if (b.status !== "pending" && b.status !== "confirmed") return false;
	const today = new Date().toISOString().split("T")[0];
	return b.date >= today;
};

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

	const barberName = (id: string | null) => (id ? (barbers.find((b) => b.id === id)?.name ?? id) : "—");

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

	/* ── guest ────────────────────────────────────────────── */
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
		{ key: "all", label: "All", count: counts.all },
		{ key: "pending", label: "Pending", count: counts.pending },
		{ key: "confirmed", label: "Confirmed", count: counts.confirmed },
		{ key: "completed", label: "Completed", count: counts.completed },
		{ key: "cancelled", label: "Cancelled", count: counts.cancelled },
	];

	/* ── authenticated ────────────────────────────────────── */
	return (
		<main className="min-h-screen w-full bg-slate-50 px-4 pb-20 p-32 sm:px-6 lg:px-8 dark:bg-slate-950">
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
					{/* ── Sidebar ──────────────────────────────────────── */}
					<aside className="w-full shrink-0 lg:w-72">
						<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
							{/* cover + avatar */}
							<div className="relative h-24 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-emerald-900 dark:to-slate-800">
								<div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
									<div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-black text-white shadow-lg dark:border-slate-900">
										{currentUser.image ? (
											<img
												src={currentUser.image}
												alt={currentUser.name}
												className="h-full w-full rounded-full object-cover"
											/>
										) : (
											getInitials(currentUser.name)
										)}
									</div>
									<span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
								</div>
							</div>

							{/* identity */}
							<div className="mt-12 px-5 pb-5 text-center">
								<h1 className="text-lg font-black text-slate-900 dark:text-slate-100">{currentUser.name}</h1>
								<span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/25 dark:text-emerald-300">
									Customer
								</span>

								<div className="mt-4 space-y-2 text-left">
									<div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
										<Phone className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
										<span className="truncate">{currentUser.phone}</span>
									</div>
								</div>
							</div>

							{/* divider */}
							<div className="mx-5 border-t border-slate-100 dark:border-slate-800" />

							{/* quick links */}
							<div className="space-y-1 p-3">
								<Link
									to={`/${locale}/booking`}
									className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
								>
									<span className="flex items-center gap-2.5">
										<CalendarPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
										{t("nav.bookAppointment")}
									</span>
									<ChevronRight className="h-4 w-4 text-slate-400" />
								</Link>
								<Link
									to={`/${locale}/barbers`}
									className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
								>
									<span className="flex items-center gap-2.5">
										<Scissors className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
										{t("nav.barbers")}
									</span>
									<ChevronRight className="h-4 w-4 text-slate-400" />
								</Link>
							</div>
						</div>

						{/* stats */}
						<div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-1">
							{[
								{ label: "Total", value: counts.all, color: "text-slate-900 dark:text-slate-100" },
								{ label: "Pending", value: counts.pending, color: "text-amber-600 dark:text-amber-400" },
								{ label: "Completed", value: counts.completed, color: "text-emerald-600 dark:text-emerald-400" },
							].map((stat) => (
								<div
									key={stat.label}
									className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex lg:items-center lg:justify-between"
								>
									<p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
									<p className={`text-2xl font-black lg:text-xl ${stat.color}`}>{stat.value}</p>
								</div>
							))}
						</div>

						<button
							type="button"
							onClick={logout}
							className="mt-2 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
						>
							{t("common.logout")}
						</button>
					</aside>

					{/* ── Main ─────────────────────────────────────────── */}
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
											{tab === "all" ? t("userPage.bookingsEmpty") : `No ${tab} bookings`}
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
										{visible.map((booking) => {
											const st = statusStyle(booking.status);
											const isCancelling = cancellingId === booking.id;
											const isConfirming = confirmId === booking.id;
											const cancellable = canCancel(booking);

											return (
												<div key={booking.id} className="flex gap-3">
													<div className={`w-1 shrink-0 rounded-full ${st.bar}`} />
													<div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
														{/* booking info row */}
														<div className="flex flex-wrap items-center justify-between gap-2">
															<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
																<span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
																	<CalendarDays className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
																	{booking.date}
																</span>
																<span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
																	<Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
																	{booking.time}
																</span>
																<span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
																	<Scissors className="h-3.5 w-3.5 shrink-0 text-slate-400" />
																	{booking.style}
																</span>
																<span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
																	<Hash className="h-3 w-3" />
																	{booking.id.slice(-6)}
																</span>
															</div>

															<div className="flex items-center gap-2">
																<span className={`rounded-full border px-3 py-1 text-xs font-semibold ${st.badge}`}>
																	{st.label}
																</span>

																<button
																	type="button"
																	onClick={() => setDetailBooking(booking)}
																	className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-slate-400 hover:text-slate-600 dark:border-slate-700 dark:text-slate-500 dark:hover:border-slate-500 dark:hover:text-slate-300"
																	title={t("userPage.viewDetails")}
																>
																	<Info className="h-3.5 w-3.5" />
																</button>

																{cancellable && !isConfirming && (
																	<button
																		type="button"
																		onClick={() => setConfirmId(booking.id)}
																		disabled={isCancelling}
																		className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
																	>
																		{isCancelling ? (
																			<RefreshCw className="h-3 w-3 animate-spin" />
																		) : (
																			<XCircle className="h-3 w-3" />
																		)}
																		{t("userPage.cancelBooking")}
																	</button>
																)}
															</div>
														</div>

														{/* inline confirmation */}
														{isConfirming && (
															<div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-900/20">
																<AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
																<p className="flex-1 text-xs font-medium text-amber-800 dark:text-amber-300">
																	{t("userPage.cancelConfirmMsg")}
																</p>
																<div className="flex gap-2">
																	<button
																		type="button"
																		onClick={() => void handleCancelConfirm(booking.id)}
																		className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95"
																	>
																		{t("userPage.cancelConfirm")}
																	</button>
																	<button
																		type="button"
																		onClick={() => setConfirmId(null)}
																		className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
																	>
																		{t("userPage.cancelKeep")}
																	</button>
																</div>
															</div>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* ── Detail modal ──────────────────────────────────── */}
			{detailBooking &&
				(() => {
					const st = statusStyle(detailBooking.status);
					return (
						<div
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
							onClick={() => setDetailBooking(null)}
						>
							<div
								className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
								onClick={(e) => e.stopPropagation()}
							>
								{/* header */}
								<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
									<div className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
											<CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
										</div>
										<h3 className="font-black text-slate-900 dark:text-slate-100">{t("userPage.detailTitle")}</h3>
									</div>
									<button
										type="button"
										onClick={() => setDetailBooking(null)}
										className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
									>
										<X className="h-4 w-4" />
									</button>
								</div>

								{/* status bar */}
								<div className={`h-1 w-full ${st.bar}`} />

								{/* rows */}
								<div className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
									{[
										{
											icon: <Hash className="h-4 w-4" />,
											label: t("userPage.detailId"),
											value: detailBooking.id,
										},
										{
											icon: <User className="h-4 w-4" />,
											label: t("bookingPage.form.labels.barber"),
											value: barberName(detailBooking.barberId),
										},
										{
											icon: <Scissors className="h-4 w-4" />,
											label: t("bookingPage.form.labels.service"),
											value: detailBooking.style,
										},
										{
											icon: <CalendarDays className="h-4 w-4" />,
											label: t("bookingPage.form.labels.date"),
											value:
												detailBooking.date && detailBooking.time
													? new Date(`${detailBooking.date}T${detailBooking.time}`).toLocaleString(undefined, {
															dateStyle: "medium",
															timeStyle: "short",
														})
													: detailBooking.date
														? new Date(detailBooking.date).toLocaleDateString(undefined, {
																dateStyle: "medium",
															})
														: "—",
										},
										{
											icon: <ClockArrowUp className="h-4 w-4" />,
											label: t("userPage.detailBookedAt"),
											value: detailBooking.createdAt
												? new Date(detailBooking.createdAt).toLocaleString(undefined, {
														dateStyle: "medium",
														timeStyle: "short",
													})
												: "—",
										},
									].map(({ icon, label, value }) => (
										<div key={label} className="flex items-center gap-3 py-3">
											<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
												{icon}
											</span>
											<div className="min-w-0 flex-1">
												<p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
													{label}
												</p>
												<p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
													{value || "—"}
												</p>
											</div>
										</div>
									))}

									{/* status row */}
									<div className="flex items-center gap-3 py-3">
										<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
											<Info className="h-4 w-4" />
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
												{t("userPage.detailStatus")}
											</p>
											<span
												className={`mt-0.5 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.badge}`}
											>
												{st.label}
											</span>
										</div>
									</div>
								</div>

								{/* footer */}
								<div className="px-5 py-4">
									<button
										type="button"
										onClick={() => setDetailBooking(null)}
										className="w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
									>
										{t("userPage.detailClose")}
									</button>
								</div>
							</div>
						</div>
					);
				})()}
		</main>
	);
};

export default UserPage;

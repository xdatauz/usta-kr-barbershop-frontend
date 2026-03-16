import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock3, Scissors, Send, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { createBookingApi, getBookingSlotsApi, type BookingStyle } from "../../lib/api/bookings";
import { getBarbersApi, type BarberProfile } from "../../lib/api/barbers";
import { getPublicServicesApi, type Service } from "../../lib/api/services";
import { isApiError } from "../../lib/api/client";

type SubmitStatus = "idle" | "sending" | "success" | "validationError" | "requestError" | "configError";


const fallbackSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const BookingPage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
	const [status, setStatus] = useState<SubmitStatus>("idle");
	const [form, setForm] = useState({
		name: "",
		phone: "",
		barberId: "",
		style: "",
		date: "",
		time: "",
	});
	const [availableSlots, setAvailableSlots] = useState<string[]>(fallbackSlots);
	const [barbers, setBarbers] = useState<BarberProfile[]>([]);
	const [services, setServices] = useState<Service[]>([]);

	const today = new Date().toISOString().split("T")[0];

	useEffect(() => {
		const loadBarbers = async () => {
			try {
				const list = await getBarbersApi();
				setBarbers(list);
			} catch {
				setBarbers([]);
			}
		};
		const loadServices = async () => {
			try {
				const list = await getPublicServicesApi();
				setServices(list);
			} catch {
				setServices([]);
			}
		};
		void loadBarbers();
		void loadServices();
	}, []);

	useEffect(() => {
		const loadSlots = async () => {
			if (!form.date || !form.barberId) {
				setAvailableSlots(fallbackSlots);
				return;
			}

			try {
				const slots = await getBookingSlotsApi(form.barberId, form.date);
				const onlyAvailable = slots.filter((slot) => slot.available).map((slot) => slot.time);
				setAvailableSlots(onlyAvailable.length ? onlyAvailable : fallbackSlots);
			} catch (error) {
				const message = isApiError(error) && error.message ? error.message : t("toast.booking.slotLoadFailed");
				toast.error(message);
				setAvailableSlots(fallbackSlots);
			}

			// Reset selected time whenever date changes
			setForm((prev) => ({ ...prev, time: "" }));
		};

		void loadSlots();
	}, [form.date, form.barberId, t]);

	// Reset time when barber changes
	useEffect(() => {
		setForm((prev) => ({ ...prev, time: "" }));
	}, [form.barberId]);

	const selectedBarberName = useMemo(() => {
		const found = barbers.find((b) => b.id === form.barberId);
		return found ? found.name : "-";
	}, [barbers, form.barberId]);

	const selectedServiceName = useMemo(() => {
		return form.style ? t(`bookingPage.styles.${form.style}`) : "-";
	}, [form.style, t]);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.name.trim() || !form.phone.trim() || !form.barberId || !form.style || !form.date || !form.time) {
			setStatus("validationError");
			return;
		}

		setStatus("sending");

		try {
			await createBookingApi({
				name: form.name.trim(),
				phone: form.phone.trim(),
				barberId: form.barberId,
				date: form.date,
				time: form.time,
				style: form.style as BookingStyle,
			});
		} catch (error) {
			setStatus("requestError");
			toast.error(isApiError(error) && error.message ? error.message : t("toast.booking.submitFailed"));
			return;
		}

		setStatus("success");
		toast.success(t("toast.booking.submitSuccess"));
		setForm({
			name: "",
			phone: "",
			barberId: "",
			style: "",
			date: "",
			time: "",
		});
	};

	return (
		<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<section className="overflow-hidden rounded-3xl border border-slate-300/70 bg-gradient-to-br from-white to-slate-100 p-5 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 sm:p-7">
					<div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
						<div className="space-y-3">
							<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
								{t("bookingPage.eyebrow")}
							</p>
							<h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 sm:text-4xl">
								{t("bookingPage.title")}
							</h1>
							<p className="max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
								{t("bookingPage.description")}
							</p>
							<div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300">
								<span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-3 py-1 dark:border-slate-700 dark:bg-slate-900/70">
									<CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
									{t("bookingPage.badges.fast")}
								</span>
								<span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-3 py-1 dark:border-slate-700 dark:bg-slate-900/70">
									<Clock3 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
									{t("bookingPage.badges.time")}
								</span>
								<span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-3 py-1 dark:border-slate-700 dark:bg-slate-900/70">
									<Scissors className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
									{t("bookingPage.badges.style")}
								</span>
							</div>
						</div>

						<div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
							<p className="font-semibold">{t("bookingPage.telegram.description")}</p>
							<p className="mt-2 leading-7">{t("bookingPage.telegram.subDescription")}</p>
						</div>
					</div>
				</section>

				<section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
					<motion.form
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						onSubmit={onSubmit}
						className="space-y-4 rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6"
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<label className="space-y-1">
								<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
									{t("bookingPage.form.labels.name")}
								</span>
								<input
									type="text"
									value={form.name}
									onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
									placeholder={t("bookingPage.form.placeholders.name")}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								/>
							</label>
							<label className="space-y-1">
								<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
									{t("bookingPage.form.labels.phone")}
								</span>
								<input
									type="tel"
									value={form.phone}
									onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
									placeholder={t("bookingPage.form.placeholders.phone")}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								/>
							</label>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<label className="space-y-1">
								<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
									{t("bookingPage.form.labels.barber")}
								</span>
								<select
									value={form.barberId}
									onChange={(event) => setForm((prev) => ({ ...prev, barberId: event.target.value }))}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								>
									<option value="">{t("bookingPage.form.placeholders.barber")}</option>
									{barbers.map((barber) => (
										<option key={barber.id} value={barber.id}>
											{barber.name}
										</option>
									))}
								</select>
							</label>
							<label className="space-y-1">
								<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
									{t("bookingPage.form.labels.service")}
								</span>
								<select
									value={form.style}
									onChange={(event) => setForm((prev) => ({ ...prev, style: event.target.value }))}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								>
									<option value="">{t("bookingPage.form.placeholders.service")}</option>
									{services.map((service) => (
										<option key={service.id} value={service.id}>
											{service.name}{service.price ? ` — ${Number(service.price).toLocaleString()}` : ""}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<label className="space-y-1">
								<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
									{t("bookingPage.form.labels.date")}
								</span>
								<input
									type="date"
									min={today}
									value={form.date}
									onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								/>
							</label>
							<label className="space-y-1">
								<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
									{t("bookingPage.form.labels.time")}
								</span>
								<select
									value={form.time}
									onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								>
									<option value="">{t("bookingPage.form.placeholders.time")}</option>
									{availableSlots.map((slot) => (
										<option key={slot} value={slot}>
											{slot}
										</option>
									))}
								</select>
							</label>
						</div>

						<button
							type="submit"
							disabled={status === "sending"}
							className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
						>
							<Send className="h-4 w-4" />
							{status === "sending" ? t("bookingPage.form.actions.sending") : t("bookingPage.form.actions.submit")}
						</button>

						{status === "success" && (
							<p className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
								<CheckCircle2 className="h-4 w-4" />
								{t("bookingPage.form.messages.success")}
							</p>
						)}
						{status === "validationError" && (
							<p className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
								<ShieldAlert className="h-4 w-4" />
								{t("bookingPage.form.messages.validationError")}
							</p>
						)}
						{status === "requestError" && (
							<p className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
								<ShieldAlert className="h-4 w-4" />
								{t("bookingPage.form.messages.sendFail")}
							</p>
						)}
						{status === "configError" && (
							<p className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
								<ShieldAlert className="h-4 w-4" />
								{t("bookingPage.form.messages.configError")}
							</p>
						)}
					</motion.form>

					<div className="space-y-4">
						<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
							<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t("bookingPage.summary.title")}</h2>
							<div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
								<p>
									<strong>{t("bookingPage.form.labels.name")}:</strong> {form.name || "-"}
								</p>
								<p>
									<strong>{t("bookingPage.form.labels.phone")}:</strong> {form.phone || "-"}
								</p>
								<p>
									<strong>{t("bookingPage.form.labels.barber")}:</strong>{" "}
									{form.barberId ? selectedBarberName : "-"}
								</p>
								<p>
									<strong>{t("bookingPage.form.labels.service")}:</strong>{" "}
									{form.style ? selectedServiceName : "-"}
								</p>
								<p>
									<strong>{t("bookingPage.form.labels.date")}:</strong> {form.date || "-"}
								</p>
								<p>
									<strong>{t("bookingPage.form.labels.time")}:</strong> {form.time || "-"}
								</p>
							</div>
						</div>

						<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
							<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t("bookingPage.help.title")}</h2>
							<p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{t("bookingPage.help.description")}</p>
							<div className="mt-4 flex flex-wrap gap-2">
								<Link
									to={`/${locale}/barbers`}
									className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
								>
									{t("bookingPage.help.barbersCta")}
								</Link>
								<Link
									to={`/${locale}/services`}
									className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
								>
									{t("bookingPage.help.servicesCta")}
								</Link>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
};

export default BookingPage;

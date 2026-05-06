import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock3, History, Scissors, Send, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { type BookingStyle } from "../../lib/api/bookings";
import { isApiError } from "../../lib/api/client";
import { toInternationalKoreanPhone } from "../../lib/phone";
import { useAuth } from "../../context/auth/auth-provider";
import { useBarbers, useBookingSlots, useCreateBooking, usePublicServices } from "../../hooks";
import { bookingFormSchema } from "../../lib/schemas/booking.schema";
import { localDateStr, tomorrowDateStr } from "../../lib/date";
import BookingBarberSelector from "./BookingBarberSelector";
import BookingServiceSelector from "./BookingServiceSelector";
import BookingTimeSlots from "./BookingTimeSlots";
import BookingSummary from "./BookingSummary";
import BookingStepper, { type BookingStepKey } from "./BookingStepper";

type SubmitStatus = "idle" | "sending" | "success" | "validationError" | "requestError" | "configError";

interface SuccessInfo {
	barberName: string;
	serviceName: string;
	date: string;
	time: string;
	reference: string;
}

const fallbackSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const BookingPage = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
	const { currentUser } = useAuth();
	const [status, setStatus] = useState<SubmitStatus>("idle");

	const searchParams = new URLSearchParams(location.search);
	const [form, setForm] = useState({
		name: currentUser?.name ?? "",
		phone: currentUser?.phone ?? "",
		barberId: searchParams.get("barberId") ?? "",
		style: "",
		date: searchParams.get("date") ?? tomorrowDateStr(),
		time: searchParams.get("time") ?? "",
	});
	const today = localDateStr();

	// React Query hooks
	const { data: barbers = [] } = useBarbers();
	const { data: services = [], isLoading: servicesLoading } = usePublicServices();
	const { data: slotsData, isFetching: slotsLoading } = useBookingSlots(form.barberId, form.date);
	const createBookingMutation = useCreateBooking();

	const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

	// Filter services based on selected barber's role
	const filteredServices = useMemo(() => {
		if (!form.barberId) return services;
		const selectedBarber = barbers.find((b) => b.id === form.barberId);
		if (!selectedBarber) return services;
		const isHead = selectedBarber.role?.toUpperCase().includes("HEAD");
		return isHead ? services : services.filter((s) => !s.isHeadBarberOnly);
	}, [form.barberId, barbers, services]);

	const slotObjects = useMemo(() => {
		const base =
			slotsData && slotsData.length
				? slotsData.map((s) => ({ time: s.time, available: s.available }))
				: fallbackSlots.map((time) => ({ time, available: true }));

		if (form.date === today) {
			const now = new Date();
			const currentMinutes = now.getHours() * 60 + now.getMinutes();
			return base.map((slot) => {
				const [h, m] = slot.time.split(":").map(Number);
				return h * 60 + m > currentMinutes ? slot : { ...slot, available: false };
			});
		}

		return base;
	}, [slotsData, form.date, today]);

	// Sync name/phone from auth once user is resolved (in case auth loads after initial render)
	useEffect(() => {
		if (!currentUser) return;
		setForm((prev) => ({
			...prev,
			name: prev.name || currentUser.name,
			phone: prev.phone || currentUser.phone,
		}));
	}, [currentUser]);

	const selectedBarberName = useMemo(() => {
		const found = barbers.find((b) => b.id === form.barberId);
		return found ? found.name : "-";
	}, [barbers, form.barberId]);

	const selectedServiceName = useMemo(() => {
		if (!form.style) return "-";
		const numId = Number(form.style);
		if (!Number.isNaN(numId)) {
			const match = services.find((s) => s.id === numId);
			if (match) return match.name;
		}
		// Backward-compat: still support legacy style keys.
		const translationKey = `bookingPage.hairstyles.${form.style}`;
		const translated = t(translationKey);
		return translated !== translationKey ? translated : form.style;
	}, [form.style, services, t]);

	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

	const stepCompleted = useMemo<Record<BookingStepKey, boolean>>(
		() => ({
			barber: !!form.barberId,
			service: !!form.style,
			datetime: !!form.date && !!form.time,
			summary: status === "success",
		}),
		[form.barberId, form.style, form.date, form.time, status],
	);

	const currentStep = useMemo<BookingStepKey>(() => {
		if (!form.barberId) return "barber";
		if (!form.style) return "service";
		if (!form.date || !form.time) return "datetime";
		return "summary";
	}, [form.barberId, form.style, form.date, form.time]);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setValidationErrors({});

		const result = bookingFormSchema.safeParse(form);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0];
				if (field && !fieldErrors[String(field)]) {
					fieldErrors[String(field)] = issue.message;
				}
			}
			setValidationErrors(fieldErrors);
			setStatus("validationError");
			return;
		}

		setStatus("sending");

		let bookingReference = "";
		try {
			const response = (await createBookingMutation.mutateAsync({
				name: result.data.name,
				phone: toInternationalKoreanPhone(result.data.phone),
				barberId: result.data.barberId,
				date: result.data.date,
				time: result.data.time,
				style: result.data.style as BookingStyle,
			})) as unknown;
			if (response && typeof response === "object") {
				const r = response as Record<string, unknown>;
				bookingReference = String(r.id ?? r.reference ?? r.bookingId ?? "");
			}
		} catch (error) {
			setStatus("requestError");
			toast.error(isApiError(error) && error.message ? error.message : t("toast.booking.submitFailed"));
			return;
		}

		setStatus("success");
		toast.success(t("toast.booking.submitSuccess"));
		setSuccessInfo({
			barberName: selectedBarberName,
			serviceName: selectedServiceName,
			date: result.data.date,
			time: result.data.time,
			reference: bookingReference,
		});
		// Keep name & phone for easy re-booking; reset only booking-specific fields.
		setForm((prev) => ({
			...prev,
			barberId: "",
			style: "",
			date: "",
			time: "",
		}));
	};

	return (
		<main className="w-full px-3 pb-14 pt-32 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="overflow-hidden flex rounded-3xl border border-border bg-card p-5 sm:p-7">
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
				</section>

				<BookingStepper currentStep={currentStep} completed={stepCompleted} />

				{status === "success" && successInfo && (
					<motion.section
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						className="rounded-3xl border border-emerald-300/70 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10 sm:p-6"
					>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div className="flex items-start gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
									<CheckCircle2 className="h-5 w-5" />
								</div>
								<div className="space-y-1">
									<h2 className="text-lg font-black text-emerald-900 dark:text-emerald-100">
										{t("bookingPage.confirmation.title")}
									</h2>
									<p className="text-sm text-emerald-800/90 dark:text-emerald-200/90">
										{t("bookingPage.confirmation.description")}
									</p>
									<dl className="mt-3 grid gap-1 text-sm text-emerald-900 dark:text-emerald-100 sm:grid-cols-2">
										{successInfo.reference && (
											<>
												<dt className="font-semibold">{t("bookingPage.confirmation.reference")}</dt>
												<dd className="font-mono">{successInfo.reference}</dd>
											</>
										)}
										<dt className="font-semibold">{t("bookingPage.form.labels.barber")}</dt>
										<dd>{successInfo.barberName}</dd>
										<dt className="font-semibold">{t("bookingPage.form.labels.service")}</dt>
										<dd>{successInfo.serviceName}</dd>
										<dt className="font-semibold">{t("bookingPage.form.labels.date")}</dt>
										<dd>{successInfo.date}</dd>
										<dt className="font-semibold">{t("bookingPage.form.labels.time")}</dt>
										<dd>{successInfo.time}</dd>
									</dl>
								</div>
							</div>
							<div className="flex shrink-0 flex-wrap gap-2">
								<Link
									to={`/${locale}/profile`}
									className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
								>
									<History className="h-4 w-4" />
									{t("userPage.bookingsTitle")}
								</Link>
								<button
									type="button"
									onClick={() => {
										setSuccessInfo(null);
										setStatus("idle");
									}}
									className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/60 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-400/40 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
								>
									{t("bookingPage.confirmation.another")}
								</button>
							</div>
						</div>
					</motion.section>
				)}

				<section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
					<motion.form
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35 }}
						onSubmit={onSubmit}
						className="space-y-4 rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-6"
					>
						<BookingBarberSelector
							name={form.name}
							phone={form.phone}
							onNameChange={(name) => setForm((prev) => ({ ...prev, name }))}
							onPhoneChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
						/>

						<BookingServiceSelector
							barberId={form.barberId}
							style={form.style}
							barbers={barbers}
							services={filteredServices}
							loading={servicesLoading}
							onBarberChange={(barberId) => setForm((prev) => ({ ...prev, barberId, time: "" }))}
							onStyleChange={(style) => setForm((prev) => ({ ...prev, style }))}
						/>

						<BookingTimeSlots
							date={form.date}
							time={form.time}
							slots={slotObjects}
							today={today}
							loading={!!form.barberId && slotsLoading}
							slotsDisabled={!form.barberId}
							disabledReason={t("quickBook.selectBarberHint")}
							onDateChange={(date) => setForm((prev) => ({ ...prev, date, time: "" }))}
							onTimeChange={(time) => setForm((prev) => ({ ...prev, time }))}
						/>

						<div className="flex gap-3">
							<button
								type="submit"
								disabled={status === "sending"}
								className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
							>
								<Send className="h-4 w-4" />
								{status === "sending" ? t("bookingPage.form.actions.sending") : t("bookingPage.form.actions.submit")}
							</button>

							<Link
								to={`/${locale}/profile`}
								className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
									status === "success"
										? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
										: "border border-slate-300 bg-white text-slate-800 hover:border-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-slate-400"
								}`}
							>
								<History className="h-4 w-4" />
								{t("userPage.bookingsTitle")}
							</Link>
						</div>

						{status === "validationError" && (
							<div className="space-y-1">
								<p className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
									<ShieldAlert className="h-4 w-4" />
									{t("bookingPage.form.messages.validationError")}
								</p>
								{Object.entries(validationErrors).map(([field, messageKey]) => (
									<p key={field} className="pl-1 text-xs text-red-600 dark:text-red-400">
										{t(messageKey, messageKey)}
									</p>
								))}
							</div>
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

					<BookingSummary
						name={form.name}
						phone={form.phone}
						barberName={form.barberId ? selectedBarberName : "-"}
						serviceName={form.style ? selectedServiceName : "-"}
						date={form.date}
						time={form.time}
						services={filteredServices}
					/>
				</section>
			</div>
		</main>
	);
};

export default BookingPage;

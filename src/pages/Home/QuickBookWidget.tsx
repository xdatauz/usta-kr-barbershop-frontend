import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Clock, User, XCircle, Loader2, ArrowRight, Scissors } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getBarbersApi, type BarberProfile } from "../../lib/api/barbers";
import api from "../../lib/api/client";

interface BookingSlot {
	time: string;
	available: boolean;
}

const getSlotsApi = async (date: string, barberId: string): Promise<BookingSlot[]> => {
	const { data } = await api.get("/bookings/slots", { params: { date, barberId } });
	const raw = data?.slots ?? [];
	return (Array.isArray(raw) ? raw : [])
		.filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
		.map((s) => ({ time: String(s.time ?? ""), available: s.available !== false }))
		.filter((s) => s.time);
};

const tomorrowStr = () => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().split("T")[0];
};
const todayStr = () => new Date().toISOString().split("T")[0];

const FieldLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
	<div className="mb-1.5 flex items-center gap-1.5">
		<span className="text-emerald-500 dark:text-emerald-400">{icon}</span>
		<span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
			{label}
		</span>
	</div>
);

export default function QuickBookWidget() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	const [date, setDate] = useState(tomorrowStr());
	const [barbers, setBarbers] = useState<BarberProfile[]>([]);
	const [barberId, setBarberId] = useState<string>("");
	const [slots, setSlots] = useState<BookingSlot[]>([]);
	const [time, setTime] = useState<string>("");
	const [slotsLoading, setSlotsLoading] = useState(false);

	useEffect(() => {
		getBarbersApi()
			.then(setBarbers)
			.catch(() => {});
	}, []);

	useEffect(() => {
		setTime("");
		if (!date || !barberId) {
			setSlots([]);
			return;
		}
		setSlotsLoading(true);
		getSlotsApi(date, barberId)
			.then(setSlots)
			.catch(() => setSlots([]))
			.finally(() => setSlotsLoading(false));
	}, [date, barberId]);

	const handleBook = () => {
		const params = new URLSearchParams({ date });
		if (barberId) params.set("barberId", barberId);
		if (time) params.set("time", time);
		navigate(`/${locale}/booking?${params.toString()}`);
	};

	const availableCount = slots.filter((s) => s.available).length;

	const fieldBase =
		"w-full rounded-xl border bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition-all duration-200 dark:bg-slate-900/90 dark:text-slate-100";
	const fieldIdle =
		"border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-700 dark:focus:border-emerald-500";

	return (
		<div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/80">
			{/* Top accent bar */}
			<div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

			<div className="p-6">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
							<Scissors className="h-4 w-4 text-white" />
						</div>
						<div>
							<p className="text-sm font-black tracking-wide text-slate-900 dark:text-slate-50">
								{t("quickBook.title")}
							</p>
							<p className="text-[11px] text-slate-500 dark:text-slate-400">
								{availableCount > 0
									? `${availableCount} ${t("quickBook.slotsAvailable")}`
									: t("quickBook.selectBarberHint")}
							</p>
						</div>
					</div>

					{/* Step dots */}
					<div className="flex items-center gap-1.5">
						{[!!date, !!barberId, !!time].map((done, i) => (
							<div
								key={i}
								className={`h-2 w-2 rounded-full transition-all duration-300 ${
									done ? "bg-emerald-500 scale-110" : "bg-slate-200 dark:bg-slate-700"
								}`}
							/>
						))}
					</div>
				</div>

				<div className="space-y-4">
					{/* Date */}
					<div>
						<FieldLabel icon={<CalendarDays className="h-3.5 w-3.5" />} label={t("quickBook.labelDate")} />
						<input
							type="date"
							value={date}
							min={todayStr()}
							onChange={(e) => setDate(e.target.value)}
							className={`${fieldBase} ${fieldIdle}`}
						/>
					</div>

					{/* Barber */}
					<div>
						<FieldLabel icon={<User className="h-3.5 w-3.5" />} label={t("quickBook.labelBarber")} />
						<select
							value={barberId}
							onChange={(e) => setBarberId(e.target.value)}
							className={`${fieldBase} ${fieldIdle} cursor-pointer`}
						>
							<option value="" disabled>{t("quickBook.selectBarber")}</option>
							{barbers.map((b) => (
								<option key={b.id} value={b.id}>
									{b.name}
								</option>
							))}
						</select>
					</div>

					{/* Time slots — only shown after a barber is selected */}
					{barberId && <div>
						<FieldLabel icon={<Clock className="h-3.5 w-3.5" />} label={t("quickBook.labelTime")} />
						{slotsLoading ? (
							<div className={`${fieldBase} border-slate-200 dark:border-slate-700 text-slate-400 flex items-center gap-2`}>
								<Loader2 className="h-4 w-4 animate-spin shrink-0 text-emerald-500" />
								{t("quickBook.loadingSlots")}
							</div>
						) : slots.length === 0 ? (
							<div className={`${fieldBase} border-orange-200 bg-orange-50/80 dark:border-orange-500/20 dark:bg-orange-500/5 text-orange-600 dark:text-orange-400 flex items-center gap-2`}>
								<XCircle className="h-4 w-4 shrink-0" />
								{t("quickBook.noSlots")}
							</div>
						) : (
							<div className="grid grid-cols-4 gap-2">
								{slots.map((s) => (
									<button
										key={s.time}
										type="button"
										disabled={!s.available}
										onClick={() => setTime(s.time)}
										className={`rounded-xl border py-2 text-xs font-semibold transition-all duration-200 ${
											time === s.time
												? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105"
												: s.available
													? "border-slate-200 bg-white/80 text-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-emerald-500"
													: "border-slate-200 bg-slate-50 text-slate-400 line-through cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-600"
										}`}
									>
										{s.time}
									</button>
								))}
							</div>
						)}
					</div>}

					{/* Book Now button */}
					<button
						type="button"
						onClick={handleBook}
						disabled={!time}
						className="group relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-40 dark:from-emerald-500 dark:to-teal-500 dark:text-slate-950 dark:hover:shadow-emerald-500/30"
					>
						<span className="absolute inset-0 translate-x-[-100%] bg-white/10 transition-transform duration-500 group-hover:translate-x-[100%]" />
						{t("quickBook.bookNow")}
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</button>
				</div>
			</div>
		</div>
	);
}

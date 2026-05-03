import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, User, ArrowRight, Scissors, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getBarbersApi, type BarberProfile } from "../../lib/api/barbers";
import { useBookingSlots } from "../../hooks";
import { localDateStr } from "../../lib/date";
import BookingTimeSlots from "../../components/booking/BookingTimeSlots";

const todayStr = () => localDateStr();

const resolveIntlLocale = (locale: string): string => {
	switch (locale) {
		case "uz":
			return "uz-Latn";
		case "kr":
			return "ko-KR";
		case "ru":
			return "ru-RU";
		case "en":
			return "en-US";
		default:
			return locale || "uz-Latn";
	}
};

function MiniCalendar({
	value,
	onChange,
	min,
	intlLocale,
}: {
	value: string;
	onChange: (d: string) => void;
	min: string;
	intlLocale: string;
}) {
	const selected = value ? new Date(value + "T00:00:00") : new Date();
	const [viewYear, setViewYear] = useState(selected.getFullYear());
	const [viewMonth, setViewMonth] = useState(selected.getMonth());

	const minDate = useMemo(() => {
		if (!min) return null;
		const d = new Date(min + "T00:00:00");
		d.setHours(0, 0, 0, 0);
		return d;
	}, [min]);

	const weekdayLabels = useMemo(() => {
		// Monday-first week
		const base = new Date(2024, 0, 1); // Jan 1 2024 is a Monday
		const formatter = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(base);
			d.setDate(base.getDate() + i);
			return formatter.format(d);
		});
	}, [intlLocale]);

	const monthLabel = useMemo(() => {
		const formatter = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" });
		return formatter.format(new Date(viewYear, viewMonth, 1));
	}, [intlLocale, viewYear, viewMonth]);

	const days = useMemo(() => {
		const first = new Date(viewYear, viewMonth, 1);
		let startDay = first.getDay() - 1;
		if (startDay < 0) startDay = 6;

		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const cells: (number | null)[] = [];

		for (let i = 0; i < startDay; i++) cells.push(null);
		for (let d = 1; d <= daysInMonth; d++) cells.push(d);

		return cells;
	}, [viewYear, viewMonth]);

	const toStr = (day: number) => {
		const m = String(viewMonth + 1).padStart(2, "0");
		const d = String(day).padStart(2, "0");
		return `${viewYear}-${m}-${d}`;
	};

	const isDisabled = (day: number) => {
		if (!minDate) return false;
		const d = new Date(viewYear, viewMonth, day);
		d.setHours(0, 0, 0, 0);
		return d < minDate;
	};

	const isToday = (day: number) => toStr(day) === todayStr();
	const isSelected = (day: number) => toStr(day) === value;

	const prevMonth = () => {
		if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
		else setViewMonth((m) => m - 1);
	};
	const nextMonth = () => {
		if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
		else setViewMonth((m) => m + 1);
	};

	const canGoPrev = !minDate || new Date(viewYear, viewMonth, 0) >= minDate;

	return (
		<div>
			<div className="mb-2 flex items-center justify-between">
				<button
					type="button"
					onClick={prevMonth}
					disabled={!canGoPrev}
					aria-label="Previous month"
					className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted disabled:opacity-30"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<span className="text-xs font-bold text-foreground">
					{monthLabel}
				</span>
				<button
					type="button"
					onClick={nextMonth}
					aria-label="Next month"
					className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<div className="grid grid-cols-7 gap-0.5 text-center">
				{weekdayLabels.map((wd) => (
					<div key={wd} className="py-1 text-[10px] font-semibold uppercase text-muted-foreground">
						{wd}
					</div>
				))}
				{days.map((day, i) =>
					day === null ? (
						<div key={`e-${i}`} />
					) : (
						<button
							key={day}
							type="button"
							disabled={isDisabled(day)}
							onClick={() => onChange(toStr(day))}
							className={`rounded-lg py-1.5 text-xs font-medium transition-colors duration-150
								${isSelected(day)
									? "bg-primary text-primary-foreground font-bold"
									: isToday(day)
										? "bg-primary-light text-primary font-bold"
										: isDisabled(day)
											? "text-muted-foreground/50 cursor-not-allowed"
											: "text-foreground hover:bg-muted"
								}`}
						>
							{day}
						</button>
					),
				)}
			</div>
		</div>
	);
}

const FieldLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
	<div className="mb-1.5 flex items-center gap-1.5">
		<span className="text-primary">{icon}</span>
		<span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
			{label}
		</span>
	</div>
);

export default function QuickBookWidget() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
	const intlLocale = useMemo(() => resolveIntlLocale(i18n.resolvedLanguage || locale), [i18n.resolvedLanguage, locale]);

	const [date, setDate] = useState(todayStr());
	const [barbers, setBarbers] = useState<BarberProfile[]>([]);
	const [barberId, setBarberId] = useState<string>("");
	const [time, setTime] = useState<string>("");

	const { data: rawSlots = [], isFetching: slotsLoading } = useBookingSlots(barberId, date);

	useEffect(() => {
		getBarbersApi()
			.then(setBarbers)
			.catch(() => {});
	}, []);

	useEffect(() => {
		setTime("");
	}, [date, barberId]);

	const slots = useMemo(() => {
		if (!barberId || !date) return [];
		if (date === todayStr()) {
			const now = new Date();
			const currentMinutes = now.getHours() * 60 + now.getMinutes();
			return rawSlots.map((s) => {
				const [h, m] = s.time.split(":").map(Number);
				return h * 60 + m > currentMinutes ? s : { ...s, available: false };
			});
		}
		return rawSlots;
	}, [rawSlots, date, barberId]);

	const handleBook = () => {
		const params = new URLSearchParams({ date });
		if (barberId) params.set("barberId", barberId);
		if (time) params.set("time", time);
		navigate(`/${locale}/booking?${params.toString()}`);
	};

	const availableCount = slots.filter((s) => s.available).length;

	const fieldBase =
		"w-full rounded-xl border bg-input-bg px-4 py-3 text-base text-foreground outline-none transition-colors duration-200";
	const fieldIdle =
		"border-input-border focus:border-primary focus:ring-2 focus:ring-ring";

	return (
		<div className="relative overflow-hidden rounded-2xl border border-border bg-card">
			{/* Top accent stripe — single solid emerald, no gradient */}
			<div className="h-1 w-full bg-primary" />

			<div className="p-5">
				{/* Header */}
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
							<Scissors className="h-4 w-4 text-primary-foreground" />
						</div>
						<div>
							<p className="text-sm font-black tracking-wide text-foreground">
								{t("quickBook.title")}
							</p>
							<p className="text-[11px] text-muted-foreground">
								{availableCount > 0
									? `${availableCount} ${t("quickBook.slotsAvailable")}`
									: t("quickBook.selectBarberHint")}
							</p>
						</div>
					</div>

					{/* Step dots */}
					<div className="flex items-center gap-1.5" aria-label="Booking steps">
						{[!!barberId, !!date, !!time].map((done, i) => (
							<div
								key={i}
								className={`h-2 w-2 rounded-full transition-colors duration-200 ${
									done ? "bg-primary" : "bg-muted"
								}`}
							/>
						))}
					</div>
				</div>

				{/* Two-column layout */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{/* Left: Barber + Calendar */}
					<div className="space-y-3">
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

						{/* Calendar */}
						<div>
							<FieldLabel icon={<Clock className="h-3.5 w-3.5" />} label={t("quickBook.labelDate")} />
							<div className="rounded-xl border border-border bg-card p-3">
								<MiniCalendar value={date} onChange={setDate} min={todayStr()} intlLocale={intlLocale} />
							</div>
						</div>
					</div>

					{/* Right: Time slots + Button */}
					<div className="flex flex-col">
						<div className="flex-1">
							<FieldLabel icon={<Clock className="h-3.5 w-3.5" />} label={t("quickBook.labelTime")} />
							<BookingTimeSlots
								slots={slots}
								selectedTime={time}
								loading={slotsLoading}
								disabled={!barberId}
								disabledReason={t("quickBook.selectBarberHint")}
								emptyMessage={t("quickBook.noSlots")}
								onTimeChange={setTime}
							/>
						</div>

						{/* Book Now button — only visible when time is picked */}
						{time && (
							<button
								type="button"
								onClick={handleBook}
								className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								{t("quickBook.bookNow")}
								<ArrowRight className="h-4 w-4" />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

import { useTranslation } from "react-i18next";

interface BookingTimeSlotsProps {
	date: string;
	time: string;
	availableSlots: string[];
	today: string;
	onDateChange: (date: string) => void;
	onTimeChange: (time: string) => void;
}

const BookingTimeSlots = ({
	date,
	time,
	availableSlots,
	today,
	onDateChange,
	onTimeChange,
}: BookingTimeSlotsProps) => {
	const { t } = useTranslation();

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<label className="space-y-1">
				<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
					{t("bookingPage.form.labels.date")}
				</span>
				<input
					type="date"
					min={today}
					value={date}
					onChange={(event) => onDateChange(event.target.value)}
					className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
				/>
			</label>
			<label className="space-y-1">
				<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
					{t("bookingPage.form.labels.time")}
				</span>
				<select
					value={time}
					onChange={(event) => onTimeChange(event.target.value)}
					className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
				>
					<option value="">{t("bookingPage.form.placeholders.time")}</option>
					{time && !availableSlots.includes(time) && (
						<option key={time} value={time}>
							{time}
						</option>
					)}
					{availableSlots.map((slot) => (
						<option key={slot} value={slot}>
							{slot}
						</option>
					))}
				</select>
			</label>
		</div>
	);
};

export default BookingTimeSlots;

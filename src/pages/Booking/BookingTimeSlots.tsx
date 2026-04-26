import { useTranslation } from "react-i18next";
import SharedBookingTimeSlots, { type BookingSlot } from "../../components/booking/BookingTimeSlots";

interface BookingTimeSlotsProps {
	date: string;
	time: string;
	slots: BookingSlot[];
	today: string;
	loading?: boolean;
	slotsDisabled?: boolean;
	disabledReason?: string;
	onDateChange: (date: string) => void;
	onTimeChange: (time: string) => void;
}

const BookingTimeSlots = ({
	date,
	time,
	slots,
	today,
	loading = false,
	slotsDisabled = false,
	disabledReason,
	onDateChange,
	onTimeChange,
}: BookingTimeSlotsProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-3">
			<label className="block space-y-1">
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
			<div className="space-y-1">
				<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
					{t("bookingPage.form.labels.time")}
				</span>
				<SharedBookingTimeSlots
					slots={slots}
					selectedTime={time}
					loading={loading}
					disabled={slotsDisabled}
					disabledReason={disabledReason}
					onTimeChange={onTimeChange}
				/>
			</div>
		</div>
	);
};

export default BookingTimeSlots;

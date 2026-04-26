import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";

export interface BookingSlot {
	time: string;
	available: boolean;
}

interface BookingTimeSlotsProps {
	slots: BookingSlot[];
	selectedTime: string;
	loading?: boolean;
	disabled?: boolean;
	disabledReason?: string;
	emptyMessage?: string;
	onTimeChange: (time: string) => void;
}

const BookingTimeSlots = ({
	slots,
	selectedTime,
	loading = false,
	disabled = false,
	disabledReason,
	emptyMessage,
	onTimeChange,
}: BookingTimeSlotsProps) => {
	const { t } = useTranslation();

	if (disabled) {
		return (
			<div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
				{disabledReason || t("quickBook.selectBarberHint")}
			</div>
		);
	}

	if (loading) {
		return (
			<div
				className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5"
				aria-busy="true"
				aria-label={t("quickBook.loadingSlots")}
			>
				{Array.from({ length: 10 }).map((_, idx) => (
					<div
						key={idx}
						className="h-10 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/70"
					/>
				))}
			</div>
		);
	}

	if (!slots.length) {
		return (
			<div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/80 px-4 py-4 text-sm text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/5 dark:text-orange-400">
				<XCircle className="h-4 w-4 shrink-0" />
				{emptyMessage || t("quickBook.noSlots")}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
			{slots.map((slot) => {
				const isSelected = slot.time === selectedTime;
				return (
					<button
						key={slot.time}
						type="button"
						disabled={!slot.available}
						onClick={() => onTimeChange(slot.time)}
						className={`rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200 ${
							isSelected
								? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105"
								: slot.available
									? "border-slate-200 bg-white/80 text-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-emerald-500"
									: "border-slate-200 bg-slate-50 text-slate-400 line-through cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-600"
						}`}
					>
						{slot.time}
					</button>
				);
			})}
		</div>
	);
};

export default BookingTimeSlots;

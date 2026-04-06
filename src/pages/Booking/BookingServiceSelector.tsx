import { useTranslation } from "react-i18next";
import type { BarberProfile } from "../../lib/api/barbers";
import type { BookingStyle } from "../../lib/api/bookings";

const BOOKING_STYLES: { value: BookingStyle; labelKey: string }[] = [
	{ value: "classic", labelKey: "bookingPage.hairstyles.classic" },
	{ value: "fade", labelKey: "bookingPage.hairstyles.fade" },
	{ value: "beard", labelKey: "bookingPage.hairstyles.beard" },
	{ value: "deluxe", labelKey: "bookingPage.hairstyles.deluxe" },
	{ value: "color", labelKey: "bookingPage.hairstyles.color" },
	{ value: "fatherSon", labelKey: "bookingPage.hairstyles.fatherSon" },
];

interface BookingServiceSelectorProps {
	barberId: string;
	style: string;
	barbers: BarberProfile[];
	onBarberChange: (barberId: string) => void;
	onStyleChange: (style: string) => void;
}

const BookingServiceSelector = ({
	barberId,
	style,
	barbers,
	onBarberChange,
	onStyleChange,
}: BookingServiceSelectorProps) => {
	const { t } = useTranslation();

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<label className="space-y-1">
				<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
					{t("bookingPage.form.labels.barber")}
				</span>
				<select
					value={barberId}
					onChange={(event) => onBarberChange(event.target.value)}
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
					value={style}
					onChange={(event) => onStyleChange(event.target.value)}
					className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
				>
					<option value="">{t("bookingPage.form.placeholders.service")}</option>
					{BOOKING_STYLES.map((s) => (
						<option key={s.value} value={s.value}>
							{t(s.labelKey)}
						</option>
					))}
				</select>
			</label>
		</div>
	);
};

export default BookingServiceSelector;

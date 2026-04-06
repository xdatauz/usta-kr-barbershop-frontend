import { useTranslation } from "react-i18next";

const formatKoreanPhone = (value: string) => {
	const digits = value.replace(/\D/g, "").slice(0, 11);
	if (digits.length <= 3) return digits;
	if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

interface BookingBarberSelectorProps {
	name: string;
	phone: string;
	onNameChange: (name: string) => void;
	onPhoneChange: (phone: string) => void;
}

const BookingBarberSelector = ({
	name,
	phone,
	onNameChange,
	onPhoneChange,
}: BookingBarberSelectorProps) => {
	const { t } = useTranslation();

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<label className="space-y-1">
				<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
					{t("bookingPage.form.labels.name")}
				</span>
				<input
					type="text"
					value={name}
					onChange={(event) => onNameChange(event.target.value)}
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
					value={phone}
					onChange={(event) => onPhoneChange(formatKoreanPhone(event.target.value))}
					placeholder={t("bookingPage.form.placeholders.phone")}
					className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
				/>
			</label>
		</div>
	);
};

export default BookingBarberSelector;

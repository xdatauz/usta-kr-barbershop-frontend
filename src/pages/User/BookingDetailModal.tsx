import { CalendarDays, Hash, Scissors, Info, X, User, ClockArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MyBooking } from "../../lib/api/bookings";
import { statusStyle } from "./BookingCard";

interface BookingDetailModalProps {
	booking: MyBooking;
	barberName: string;
	onClose: () => void;
}

const BookingDetailModal = ({ booking, barberName, onClose }: BookingDetailModalProps) => {
	const { t } = useTranslation();
	const st = statusStyle(booking.status);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
			onClick={onClose}
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
						onClick={onClose}
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
							value: booking.id,
						},
						{
							icon: <User className="h-4 w-4" />,
							label: t("bookingPage.form.labels.barber"),
							value: barberName,
						},
						{
							icon: <Scissors className="h-4 w-4" />,
							label: t("bookingPage.form.labels.service"),
							value: booking.style,
						},
						{
							icon: <CalendarDays className="h-4 w-4" />,
							label: t("bookingPage.form.labels.date"),
							value:
								booking.date && booking.time
									? new Date(`${booking.date}T${booking.time}`).toLocaleString(undefined, {
											dateStyle: "medium",
											timeStyle: "short",
										})
									: booking.date
										? new Date(booking.date).toLocaleDateString(undefined, {
												dateStyle: "medium",
											})
										: "\u2014",
						},
						{
							icon: <ClockArrowUp className="h-4 w-4" />,
							label: t("userPage.detailBookedAt"),
							value: booking.createdAt
								? new Date(booking.createdAt).toLocaleString(undefined, {
										dateStyle: "medium",
										timeStyle: "short",
									})
								: "\u2014",
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
									{value || "\u2014"}
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
						onClick={onClose}
						className="w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
					>
						{t("userPage.detailClose")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default BookingDetailModal;

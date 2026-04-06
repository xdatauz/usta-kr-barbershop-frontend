import {
	CalendarDays,
	Clock3,
	Scissors,
	RefreshCw,
	Hash,
	XCircle,
	AlertTriangle,
	Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MyBooking } from "../../lib/api/bookings";

const STATUS_STYLE: Record<string, { badge: string; bar: string; label: string }> = {
	pending: {
		badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
		bar: "bg-amber-400",
		label: "Pending",
	},
	confirmed: {
		badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
		bar: "bg-blue-500",
		label: "Confirmed",
	},
	completed: {
		badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
		bar: "bg-emerald-500",
		label: "Completed",
	},
	cancelled: {
		badge: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
		bar: "bg-red-400",
		label: "Cancelled",
	},
};

export const statusStyle = (s: string) => STATUS_STYLE[s] ?? STATUS_STYLE.pending;

/** Can only cancel pending/confirmed bookings that are today or in the future */
export const canCancel = (b: MyBooking): boolean => {
	if (b.status !== "pending" && b.status !== "confirmed") return false;
	const today = new Date().toISOString().split("T")[0];
	return b.date >= today;
};

interface BookingCardProps {
	booking: MyBooking;
	cancellingId: string | null;
	confirmId: string | null;
	onViewDetail: (booking: MyBooking) => void;
	onRequestCancel: (id: string) => void;
	onConfirmCancel: (id: string) => void;
	onDismissCancel: () => void;
}

const BookingCard = ({
	booking,
	cancellingId,
	confirmId,
	onViewDetail,
	onRequestCancel,
	onConfirmCancel,
	onDismissCancel,
}: BookingCardProps) => {
	const { t } = useTranslation();
	const st = statusStyle(booking.status);
	const isCancelling = cancellingId === booking.id;
	const isConfirming = confirmId === booking.id;
	const cancellable = canCancel(booking);

	return (
		<div className="flex gap-3">
			<div className={`w-1 shrink-0 rounded-full ${st.bar}`} />
			<div className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
				{/* booking info row */}
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
						<span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
							<CalendarDays className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
							{booking.date}
						</span>
						<span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
							<Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							{booking.time}
						</span>
						<span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
							<Scissors className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							{booking.style}
						</span>
						<span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
							<Hash className="h-3 w-3" />
							{booking.id.slice(-6)}
						</span>
					</div>

					<div className="flex items-center gap-2">
						<span className={`rounded-full border px-3 py-1 text-xs font-semibold ${st.badge}`}>
							{st.label}
						</span>

						<button
							type="button"
							onClick={() => onViewDetail(booking)}
							className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-slate-400 hover:text-slate-600 dark:border-slate-700 dark:text-slate-500 dark:hover:border-slate-500 dark:hover:text-slate-300"
							title={t("userPage.viewDetails")}
						>
							<Info className="h-3.5 w-3.5" />
						</button>

						{cancellable && !isConfirming && (
							<button
								type="button"
								onClick={() => onRequestCancel(booking.id)}
								disabled={isCancelling}
								className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
							>
								{isCancelling ? (
									<RefreshCw className="h-3 w-3 animate-spin" />
								) : (
									<XCircle className="h-3 w-3" />
								)}
								{t("userPage.cancelBooking")}
							</button>
						)}
					</div>
				</div>

				{/* inline confirmation */}
				{isConfirming && (
					<div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-900/20">
						<AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
						<p className="flex-1 text-xs font-medium text-amber-800 dark:text-amber-300">
							{t("userPage.cancelConfirmMsg")}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => void onConfirmCancel(booking.id)}
								className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95"
							>
								{t("userPage.cancelConfirm")}
							</button>
							<button
								type="button"
								onClick={onDismissCancel}
								className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
							>
								{t("userPage.cancelKeep")}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default BookingCard;

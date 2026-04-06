import { Phone, CalendarPlus, Scissors, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface UserSidebarProps {
	currentUser: { name: string; phone: string; image: string | null };
	locale: string;
	counts: { all: number; pending: number; completed: number };
	onLogout: () => void;
}

const getInitials = (name: string) => {
	const parts = name.trim().split(/\s+/);
	return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
};

const UserSidebar = ({ currentUser, locale, counts, onLogout }: UserSidebarProps) => {
	const { t } = useTranslation();

	return (
		<aside className="w-full shrink-0 lg:w-72">
			<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
				{/* cover + avatar */}
				<div className="relative h-24 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-emerald-900 dark:to-slate-800">
					<div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
						<div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-black text-white shadow-lg dark:border-slate-900">
							{currentUser.image ? (
								<img
									src={currentUser.image}
									alt={currentUser.name}
									className="h-full w-full rounded-full object-cover"
								/>
							) : (
								getInitials(currentUser.name)
							)}
						</div>
						<span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
					</div>
				</div>

				{/* identity */}
				<div className="mt-12 px-5 pb-5 text-center">
					<h1 className="text-lg font-black text-slate-900 dark:text-slate-100">{currentUser.name}</h1>
					<span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/25 dark:text-emerald-300">
						Customer
					</span>

					<div className="mt-4 space-y-2 text-left">
						<div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
							<Phone className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
							<span className="truncate">{currentUser.phone}</span>
						</div>
					</div>
				</div>

				{/* divider */}
				<div className="mx-5 border-t border-slate-100 dark:border-slate-800" />

				{/* quick links */}
				<div className="space-y-1 p-3">
					<Link
						to={`/${locale}/booking`}
						className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
					>
						<span className="flex items-center gap-2.5">
							<CalendarPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
							{t("nav.bookAppointment")}
						</span>
						<ChevronRight className="h-4 w-4 text-slate-400" />
					</Link>
					<Link
						to={`/${locale}/barbers`}
						className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
					>
						<span className="flex items-center gap-2.5">
							<Scissors className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
							{t("nav.barbers")}
						</span>
						<ChevronRight className="h-4 w-4 text-slate-400" />
					</Link>
				</div>
			</div>

			{/* stats */}
			<div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-1">
				{[
					{ label: "Total", value: counts.all, color: "text-slate-900 dark:text-slate-100" },
					{ label: "Pending", value: counts.pending, color: "text-amber-600 dark:text-amber-400" },
					{ label: "Completed", value: counts.completed, color: "text-emerald-600 dark:text-emerald-400" },
				].map((stat) => (
					<div
						key={stat.label}
						className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex lg:items-center lg:justify-between"
					>
						<p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
						<p className={`text-2xl font-black lg:text-xl ${stat.color}`}>{stat.value}</p>
					</div>
				))}
			</div>

			<button
				type="button"
				onClick={onLogout}
				className="mt-2 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
			>
				{t("common.logout")}
			</button>
		</aside>
	);
};

export default UserSidebar;

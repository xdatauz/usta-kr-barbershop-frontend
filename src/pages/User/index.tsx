import { UserRound, Mail, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth/auth-provider";

const UserPage = () => {
	const { t } = useTranslation();
	const { currentUser } = useAuth();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	if (!currentUser) {
		return (
			<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
				<div className="mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
					<h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t("userPage.guestTitle")}</h1>
					<p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("userPage.guestDescription")}</p>
					<Link to={`/${locale}`} className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-500 dark:text-slate-950">
						{t("userPage.backHome")}
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-5xl space-y-5">
				<div className="rounded-2xl border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
					<h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t("userPage.title")}</h1>
					<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("userPage.subtitle")}</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-2xl border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
						<div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
							<p className="inline-flex items-center gap-2">
								<UserRound className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
								{currentUser.name}
							</p>
							<p className="inline-flex items-center gap-2">
								<Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
								{currentUser.email}
							</p>
							<p className="inline-flex items-center gap-2">
								<BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
								{currentUser.userType}
							</p>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
						<h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("userPage.bookingsTitle")}</h2>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("userPage.bookingsEmpty")}</p>
					</div>
				</div>
			</div>
		</main>
	);
};

export default UserPage;


import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface UserProfileMenuProps {
	currentUser?: {
		id: string;
		userType: "ADMIN" | "USER" | "BARBER";
		image?: string | null;
		avatar?: string | null;
		profileImage?: string | null;
		name?: string;
	};
	locale?: string;
	onAuthOpen?: () => void;
	closeMenuHandler?: () => void;
	logoutHandler: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
	currentUser,
	locale,
	onAuthOpen,
	closeMenuHandler,
}) => {
	const { t } = useTranslation();

	const localePrefix = useMemo(() => {
		if (!locale) return "";
		return locale.startsWith("/") ? locale : `/${locale}`;
	}, [locale]);

	const defaultAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
			<rect width="100%" height="100%" fill="#111827"/>
			<circle cx="32" cy="24" r="12" fill="#9CA3AF"/>
			<path d="M12 56c3-10 11-16 20-16s17 6 20 16" fill="#9CA3AF"/>
		</svg>`,
	)}`;

	const userImage = currentUser?.profileImage || currentUser?.avatar || currentUser?.image || defaultAvatar;

	if (!currentUser) {
		return (
			<button
				type="button"
				onClick={onAuthOpen}
				className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-900"
			>
				{t("profile.signIn")}
			</button>
		);
	}

	return (
		<Link
			to={`${localePrefix}/profile`}
			onClick={closeMenuHandler}
			aria-label={t("profile.myProfile")}
			className="block rounded-full ring-2 ring-transparent transition hover:ring-emerald-500 dark:hover:ring-emerald-400"
		>
			<img
				src={userImage}
				alt={currentUser.name ?? t("profile.imageAlt")}
				className="h-9 w-9 rounded-full border border-slate-300 object-cover dark:border-slate-600"
				onError={(e) => { e.currentTarget.src = defaultAvatar; }}
			/>
		</Link>
	);
};

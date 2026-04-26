import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AuthUserType } from "../../context/auth/auth-provider";

interface UserProfileMenuProps {
	currentUser?: {
		id: string;
		userType: AuthUserType;
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

const AVATAR_COLORS = [
	"#10B981",
	"#3B82F6",
	"#F59E0B",
	"#EF4444",
	"#8B5CF6",
	"#EC4899",
	"#06B6D4",
	"#6366F1",
	"#14B8A6",
	"#F97316",
];

const generateInitials = (name?: string): string => {
	if (!name) return "?";
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 3);
};

const getColorFromName = (name?: string): string => {
	if (!name) return AVATAR_COLORS[0];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

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

	const defaultAvatar = useMemo(() => {
		const initials = generateInitials(currentUser?.name);
		const bgColor = getColorFromName(currentUser?.name);
		return `data:image/svg+xml;utf8,${encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
				<rect width="100%" height="100%" fill="${bgColor}"/>
				<text x="32" y="38" font-size="28" font-weight="bold" fill="white" text-anchor="middle" font-family="system-ui, sans-serif">${initials}</text>
			</svg>`,
		)}`;
	}, [currentUser?.name]);

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
				onError={(e) => {
					e.currentTarget.src = defaultAvatar;
				}}
			/>
		</Link>
	);
};

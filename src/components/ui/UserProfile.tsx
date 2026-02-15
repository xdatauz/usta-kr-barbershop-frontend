import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaCrown } from "react-icons/fa";
import { ChevronDown, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserProfileMenuProps {
	currentUser?: {
		_id: string;
		userType: "ADMIN" | "USER";
		image?: string | null;
		avatar?: string | null;
		profileImage?: string | null;
		name?: string;
	};
	locale?: string;
	closeMenuHandler?: () => void;
	logoutHandler: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
	currentUser,
	locale,
	closeMenuHandler,
	logoutHandler,
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const localePrefix = useMemo(() => {
		if (!locale) {
			return "";
		}
		return locale.startsWith("/") ? locale : `/${locale}`;
	}, [locale]);

	const buildPath = (path: string) => `${localePrefix}${path}`;

	const defaultAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
			<rect width="100%" height="100%" fill="#111827"/>
			<circle cx="32" cy="24" r="12" fill="#9CA3AF"/>
			<path d="M12 56c3-10 11-16 20-16s17 6 20 16" fill="#9CA3AF"/>
		</svg>`,
	)}`;

	const userImage = currentUser?.profileImage || currentUser?.avatar || currentUser?.image || defaultAvatar;

	const closeDropdown = () => {
		setIsOpen(false);
		closeMenuHandler?.();
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	if (!currentUser) {
		return (
			<Link
				to={buildPath("/login")}
				className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-100 md:text-base dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-900"
			>
				{t("profile.signIn")}
			</Link>
		);
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center gap-2 rounded-full border border-slate-300 px-2 py-1 text-slate-700 transition-colors hover:border-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-900"
				aria-expanded={isOpen}
				aria-label={t("profile.toggleMenu")}
			>
				<img
					src={userImage}
					alt={currentUser?.name ? `${currentUser.name} ${t("profile.imageAltSuffix")}` : t("profile.imageAlt")}
					className="h-9 w-9 rounded-full border border-slate-300 object-cover dark:border-slate-600"
					onError={(event) => {
						event.currentTarget.src = defaultAvatar;
					}}
				/>
				<ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
			</button>

			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-lg border border-slate-300 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
					<Link
						to={buildPath(`/user/my-page?userId=${currentUser._id}`)}
						className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:text-base dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
						onClick={closeDropdown}
					>
						{t("profile.myProfile")}
					</Link>
					<Link
						to={buildPath("/user/last-visited")}
						className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:text-base dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
						onClick={closeDropdown}
					>
						{t("profile.lastVisited")}
					</Link>
					{currentUser.userType === "ADMIN" && (
						<Link
							to="/_admin"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:text-base dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
							onClick={closeDropdown}
						>
							<p className="mr-1">{t("profile.dashboard")}</p>
							<FaCrown className="text-yellow-500 text-lg" />
						</Link>
					)}
					<Link
						to={buildPath("/user/barbers")}
						className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:text-base dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
						onClick={closeDropdown}
					>
						{t("profile.myBarbers")}
					</Link>
					<Link
						to={buildPath("/user/notifications")}
						className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:text-base dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
						onClick={closeDropdown}
					>
						{t("profile.notifications")}
					</Link>
					<Link
						to={buildPath("/user/cs")}
						className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:text-base dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
						onClick={closeDropdown}
					>
						{t("profile.customerService")}
					</Link>
					<button
						type="button"
						className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 hover:text-red-700 md:text-base dark:text-red-300 dark:hover:text-red-200"
						onClick={() => {
							logoutHandler();
							closeDropdown();
						}}
					>
						<LogOut className="w-4 h-4" />
						{t("profile.logout")}
					</button>
				</div>
			)}
		</div>
	);
};

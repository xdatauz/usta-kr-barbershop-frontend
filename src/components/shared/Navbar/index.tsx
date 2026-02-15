import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Instagram, Send, Menu, X, Phone, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "../../ui/ThemeToggle";
import { UserProfileMenu } from "../../ui/UserProfile";
import AuthModal from "../../ui/AuthModal";
import { useAuth } from "../../../context/auth/auth-provider";

interface NavbarProps {
	scrolled: boolean;
}

const Navbar = ({ scrolled }: NavbarProps) => {
	const location = useLocation();
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
	const locale = location.pathname.split("/")[1] || "uz";
	const { currentUser, logout } = useAuth();

	const logoutHandler = () => {
		logout();
	};

	const navItems = [
		{ key: "nav.home", path: "" },
		{ key: "nav.services", path: "services" },
		{ key: "nav.gallery", path: "gallery" },
		{ key: "nav.about", path: "about" },
		{ key: "nav.contact", path: "contact" },
	];

	return (
		<header
			className={`w-full fixed top-0 z-50 transition-all duration-300 ${
				scrolled
					? "border-b border-slate-300/70 bg-white/95 py-3 shadow-md dark:border-slate-800 dark:bg-slate-950/95"
					: "border-b border-slate-300/50 bg-white/75 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
			}`}
		>
			<div className="navbar-container mx-auto px-6 flex items-center justify-between">
				{/* LOGO */}
				<Link
					to={`/${locale}`}
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
					className="text-xl font-black tracking-[0.14em] text-slate-900 sm:text-2xl dark:text-slate-100"
				>
					USTA <span className="text-emerald-600 dark:text-emerald-400">BARBER</span>
				</Link>

				{/* DESKTOP NAV */}
				<nav className="hidden lg:flex items-center gap-8">
					{navItems.map((item) => {
						const isActive =
							item.path === ""
								? location.pathname === `/${locale}`
								: location.pathname.startsWith(`/${locale}/${item.path}`);

						return (
							<Link
								key={item.key}
								to={`/${locale}${item.path ? `/${item.path}` : ""}`}
								className={`relative font-medium transition duration-300 ${
									isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
								}`}
							>
								{t(item.key)}
							</Link>
						);
					})}

					{/* THEME TOGGLE */}
					<ThemeToggle />

					{/* USER PROFILE */}
					<UserProfileMenu
						currentUser={currentUser ?? undefined}
						locale={locale}
						onAuthOpen={() => setIsAuthModalOpen(true)}
						closeMenuHandler={() => setIsOpen(false)}
						logoutHandler={logoutHandler}
					/>

					{/* LANGUAGE SWICHTER */}
					<LanguageSwitcher />

					{/* SOCIALS */}
					<div className="flex items-center gap-4 border-l border-slate-300 pl-6 dark:border-slate-700">
						<a
							href="https://www.instagram.com/usta_2019"
							target="_blank"
							rel="noopener noreferrer"
							className="text-slate-700 transition hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
						>
							<Instagram className="w-5 h-5" />
						</a>
						<a
							href="https://t.me/usta_2019"
							target="_blank"
							rel="noopener noreferrer"
							className="text-slate-700 transition hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
						>
							<Send className="w-5 h-5" />
						</a>
						<a
							href="https://www.usta.best"
							target="_blank"
							rel="noopener noreferrer"
							className="text-slate-700 transition hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
						>
							<ExternalLink className="w-5 h-5" />
						</a>
					</div>
				</nav>

				{/* MOBILE BUTTON */}
				<div className="lg:hidden">
					<button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 dark:text-slate-100">
						{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>
			</div>

			{/* MOBILE MENU */}
			{isOpen && (
				<div className="border-t border-slate-300 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950 lg:hidden">
					<div className="flex flex-col gap-5 px-6 py-6">
						{navItems.map((item) => {
							const targetPath = `/${locale}${item.path ? `/${item.path}` : ""}`;
							const isActive =
								item.path === ""
									? location.pathname === `/${locale}`
									: location.pathname.startsWith(`/${locale}/${item.path}`);

							return (
								<Link
									key={item.key}
									to={targetPath}
									onClick={() => setIsOpen(false)}
									className={`text-lg font-medium transition ${
										isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
									}`}
								>
									{t(item.key)}
								</Link>
							);
						})}

						{/* Mobile CTA */}
						<a
							href="tel:+998901234567"
							className="mt-4 flex items-center justify-center gap-2 rounded-md bg-emerald-600 py-3 text-white transition hover:bg-emerald-700"
						>
							<Phone className="w-4 h-4" />
							{t("nav.bookAppointment")}
						</a>

						{/* Socials */}
						<div className="flex justify-center gap-8 border-t border-slate-300 pt-6 dark:border-slate-700">
							<a
								href="https://www.instagram.com/usta_2019"
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-700 transition hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
							>
								<Instagram className="w-6 h-6" />
							</a>

							<a
								href="https://t.me/usta_2019"
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-700 transition hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
							>
								<Send className="w-6 h-6" />
							</a>
						</div>
					</div>
				</div>
			)}

			<AuthModal
				isOpen={isAuthModalOpen}
				onClose={() => setIsAuthModalOpen(false)}
			/>
		</header>
	);
};

export default Navbar;

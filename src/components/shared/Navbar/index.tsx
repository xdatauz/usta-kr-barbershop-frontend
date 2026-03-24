import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Instagram, Send, Menu, X, ExternalLink, Phone } from "lucide-react";
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

	const navItems = [
		{ key: "nav.home", path: "" },
		{ key: "nav.services", path: "services" },		
		{ key: "nav.gallery", path: "gallery" },
		{ key: "nav.about", path: "about" },
		{ key: "nav.contact", path: "contact" },
	];

	return (
		<header className="w-full fixed top-0 z-50">
			{/* ── FLOOR 1: top utility bar ── */}
			<div className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
				<div className="navbar-container mx-auto flex h-10 items-center justify-between px-6">
					{/* Left: phone */}
					<a
						href="tel:+820107699662"
						className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
					>
						<Phone className="h-3 w-3" />
						010-4619-5515
					</a>

					{/* Right: socials · divider · language · theme */}
					<div className="flex items-center gap-3">
						<a
							href="https://www.instagram.com/usta.barbershop"
							target="_blank"
							rel="noopener noreferrer"
							className="text-slate-400 transition hover:text-emerald-600 dark:hover:text-emerald-400"
						>
							<Instagram className="h-3.5 w-3.5" />
						</a>
						<a
							href="https://t.me/usta_2019"
							target="_blank"
							rel="noopener noreferrer"
							className="text-slate-400 transition hover:text-emerald-600 dark:hover:text-emerald-400"
						>
							<Send className="h-3.5 w-3.5" />
						</a>
						<a
							href="https://www.usta.best"
							target="_blank"
							rel="noopener noreferrer"
							className="text-slate-400 transition hover:text-emerald-600 dark:hover:text-emerald-400"
						>
							<ExternalLink className="h-3.5 w-3.5" />
						</a>

						<div className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700" />

						<ThemeToggle />
					</div>
				</div>
			</div>

			{/* ── FLOOR 2: main nav ── */}
			<div
				className={`transition-all duration-300 ${
					scrolled
						? "bg-white/95 shadow-md backdrop-blur-md dark:bg-slate-950/95"
						: "bg-white/80 backdrop-blur-md dark:bg-slate-950/80"
				}`}
			>
				<div className="navbar-container mx-auto flex items-center justify-between px-6 py-3">
					{/* Logo */}
					<Link
						to={`/${locale}`}
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="flex shrink-0 items-center"
					>
						<img src="/logos/main-logo.jpg" alt="Usta Barber" className="h-10 w-auto object-contain sm:h-12" />
					</Link>

					{/* Desktop nav links */}
					<nav className="hidden items-center gap-7 lg:flex">
						{navItems.map((item) => {
							const isActive =
								item.path === ""
									? location.pathname === `/${locale}`
									: location.pathname.startsWith(`/${locale}/${item.path}`);

							return (
								<Link
									key={item.key}
									to={`/${locale}${item.path ? `/${item.path}` : ""}`}
									className={`relative text-sm font-medium transition duration-300
										after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full
										after:bg-emerald-500 after:transition-all after:duration-300
										hover:after:w-full
										${
											isActive
												? "text-emerald-600 after:w-full dark:text-emerald-400"
												: "text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
										}`}
								>
									{t(item.key)}
								</Link>
							);
						})}
					</nav>

					{/* Desktop right: language + user profile */}
					<div className="hidden lg:flex items-center gap-3">
						<UserProfileMenu
							currentUser={currentUser ?? undefined}
							locale={locale}
							onAuthOpen={() => setIsAuthModalOpen(true)}
							closeMenuHandler={() => setIsOpen(false)}
							logoutHandler={logout}
						/>
						<LanguageSwitcher />
					</div>

					{/* Mobile hamburger */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="rounded-lg p-1.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
					>
						{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>
			</div>

			{/* ── MOBILE MENU ── */}
			{isOpen && (
				<div className="border-t border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:hidden">
					<div className="flex flex-col gap-1 px-6 py-5">
						{/* Nav links */}
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
									className={`rounded-lg px-3 py-2.5 text-base font-medium transition ${
										isActive
											? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
											: "text-slate-700 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
									}`}
								>
									{t(item.key)}
								</Link>
							);
						})}

						{/* Auth */}
						<div className="mt-2 border-t border-slate-100 pt-4 dark:border-slate-800">
							<UserProfileMenu
								currentUser={currentUser ?? undefined}
								locale={locale}
								onAuthOpen={() => {
									setIsAuthModalOpen(true);
									setIsOpen(false);
								}}
								closeMenuHandler={() => setIsOpen(false)}
								logoutHandler={logout}
							/>
						</div>

						{/* Socials */}
						<div className="mt-2 flex items-center justify-center gap-6 border-t border-slate-100 pt-4 dark:border-slate-800">
							<a
								href="https://www.instagram.com/usta.barbershop"
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-400 transition hover:text-emerald-600 dark:hover:text-emerald-400"
							>
								<Instagram className="h-5 w-5" />
							</a>
							<a
								href="https://t.me/usta_2019"
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-400 transition hover:text-emerald-600 dark:hover:text-emerald-400"
							>
								<Send className="h-5 w-5" />
							</a>
							<a
								href="https://www.usta.best"
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-400 transition hover:text-emerald-600 dark:hover:text-emerald-400"
							>
								<ExternalLink className="h-5 w-5" />
							</a>
						</div>
					</div>
				</div>
			)}

			<AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
		</header>
	);
};

export default Navbar;

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Instagram, Send, Menu, X, Phone, ExternalLink } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "../../ui/ThemeToggle";
import { UserProfileMenu } from "../../ui/UserProfile";

interface NavbarProps {
	scrolled: boolean;
}

const Navbar = ({ scrolled }: NavbarProps) => {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const locale = location.pathname.split("/")[1] || "uz";

	const currentUser = {
		_id: "123",
		userType: "USER" as "USER" | "ADMIN",
	};

	const logoutHandler = () => {
		console.log("Logging out...");
	};

	const navItems = [
		{ name: "Home", path: "" },
		{ name: "Services", path: "services" },
		{ name: "Gallery", path: "gallery" },
		{ name: "About", path: "about" },
		{ name: "Contact", path: "contact" },
	];

	return (
		<header
			className={`w-full fixed top-0 z-50 transition-all duration-300 ${
				scrolled ? "bg-gray-800 shadow-md py-3" : "bg-gray-900 backdrop-blur-md py-5"
			}`}
		>
			<div className="navbar-container mx-auto px-6 flex items-center justify-between">
				{/* LOGO */}
				<Link to="/" className="text-2xl font-bold tracking-widest text-white">
					USTA <span className="text-green-600">BARBER</span>
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
								key={item.name}
								to={`/${locale}${item.path ? `/${item.path}` : ""}`}
								className={`relative font-medium transition duration-300 ${
									isActive ? "text-green-600" : "text-white hover:text-green-600"
								}`}
							>
								{item.name}
							</Link>
						);
					})}

					{/* THEME TOGGLE */}
					<ThemeToggle />

					{/* LANGUAGE SWICHTER */}
					<LanguageSwitcher />

					{/* SOCIALS */}
					<div className="flex items-center gap-4 pl-6 border-l border-neutral-700/50">
						<a
							href="https://www.instagram.com/usta_2019"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white hover:text-green-600 transition"
						>
							<Instagram className="w-5 h-5" />
						</a>
						<a
							href="https://t.me/usta_2019"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white hover:text-green-600 transition"
						>
							<Send className="w-5 h-5" />
						</a>
						<a
							href="https://www.usta.best"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white hover:text-green-600 transition"
						>
							<ExternalLink className="w-5 h-5" />
            </a>
            
            {/* TODO: Shu qismiga keldim */}
						{/* <UserProfileMenu
							currentUser={currentUser}
							closeMenuHandler={() => setIsOpen(false)}
							logoutHandler={logoutHandler}
						/> */}
					</div>
				</nav>

				{/* MOBILE BUTTON */}
				<div className="lg:hidden">
					<button onClick={() => setIsOpen(!isOpen)} className="text-white">
						{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>
			</div>

			{/* MOBILE MENU */}
			{isOpen && (
				<div className="lg:hidden bg-black shadow-lg border-t border-neutral-800">
					<div className="flex flex-col gap-5 px-6 py-6">
						{navItems.map((item) => {
							const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

							return (
								<Link
									key={item.name}
									to={item.path}
									onClick={() => setIsOpen(false)}
									className={`text-lg font-medium transition ${
										isActive ? "text-green-600" : "text-white hover:text-green-600"
									}`}
								>
									{item.name}
								</Link>
							);
						})}

						{/* Mobile CTA */}
						<a
							href="tel:+998901234567"
							className="mt-4 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
						>
							<Phone className="w-4 h-4" />
							Book Appointment
						</a>

						{/* Socials */}
						<div className="flex justify-center gap-8 pt-6 border-t border-neutral-700/50">
							<a
								href="https://instagram.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-white hover:text-green-600 transition"
							>
								<Instagram className="w-6 h-6" />
							</a>

							<a
								href="https://t.me/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-white hover:text-green-600 transition"
							>
								<Send className="w-6 h-6" />
							</a>
						</div>
					</div>
				</div>
			)}
		</header>
	);
};

export default Navbar;

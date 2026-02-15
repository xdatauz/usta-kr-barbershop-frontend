// src/widgets/Navbar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Instagram, Send, Menu, X, Phone } from "lucide-react";

interface NavbarProps {
	scrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);

	const navItems = [
		{ name: "Home", path: "/" },
		{ name: "Services", path: "/services" },
		{ name: "Gallery", path: "/gallery" },
		{ name: "About", path: "/about" },
		{ name: "Contact", path: "/contact" },
	];

	return (
		<header
			className={`fixed top-0 z-50 w-full transition-all duration-300 ${
				scrolled ? "bg-white shadow-md py-3" : "bg-white/70 backdrop-blur-md py-5"
			}`}
		>
			<div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
				{/* LOGO */}
				<Link to="/" className="text-2xl font-bold tracking-widest text-neutral-900">
					USTA <span className="text-green-700">BARBER</span>
				</Link>

				{/* DESKTOP NAV */}
				<nav className="hidden lg:flex items-center gap-8">
					{navItems.map((item) => {
						const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

						return (
							<Link
								key={item.name}
								to={item.path}
								className={`relative font-medium transition duration-300 ${
									isActive ? "text-green-700" : "text-neutral-800 hover:text-green-700"
								}`}
							>
								{item.name}

								{/* Animated underline */}
								<span
									className={`absolute left-0 -bottom-1 h-[2px] bg-green-700 transition-all duration-300 ${
										isActive ? "w-full" : "w-0 group-hover:w-full"
									}`}
								/>
							</Link>
						);
					})}

					{/* CALL BUTTON */}
					<a
						href="tel:+998901234567"
						className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-md hover:bg-green-800 transition duration-300"
					>
						<Phone className="w-4 h-4" />
						Book Now
					</a>

					{/* SOCIALS */}
					<div className="flex items-center gap-4 pl-6 border-l border-neutral-300">
						<a
							href="https://instagram.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-neutral-800 hover:text-green-700 transition"
						>
							<Instagram className="w-5 h-5" />
						</a>

						<a
							href="https://t.me/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-neutral-800 hover:text-green-700 transition"
						>
							<Send className="w-5 h-5" />
						</a>
					</div>
				</nav>

				{/* MOBILE BUTTON */}
				<div className="lg:hidden">
					<button onClick={() => setIsOpen(!isOpen)} className="text-neutral-900">
						{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>
			</div>

			{/* MOBILE MENU */}
			{isOpen && (
				<div className="lg:hidden bg-white shadow-lg border-t">
					<div className="flex flex-col gap-5 px-6 py-6">
						{navItems.map((item) => {
							const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

							return (
								<Link
									key={item.name}
									to={item.path}
									onClick={() => setIsOpen(false)}
									className={`text-lg font-medium transition ${
										isActive ? "text-green-700" : "text-neutral-800 hover:text-green-700"
									}`}
								>
									{item.name}
								</Link>
							);
						})}

						{/* Mobile CTA */}
						<a
							href="tel:+998901234567"
							className="mt-4 flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-md hover:bg-green-800 transition"
						>
							<Phone className="w-4 h-4" />
							Book Appointment
						</a>

						{/* Socials */}
						<div className="flex justify-center gap-8 pt-6 border-t border-neutral-200">
							<a
								href="https://instagram.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-neutral-800 hover:text-green-700 transition"
							>
								<Instagram className="w-6 h-6" />
							</a>

							<a
								href="https://t.me/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-neutral-800 hover:text-green-700 transition"
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

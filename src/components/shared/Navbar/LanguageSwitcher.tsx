import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { FlagComponents } from "../../ui/Flags";

/* ============================= */
/*           LOCALES             */
/* ============================= */

export type Locale = "kr" | "ru" | "uz" | "en";

export const locales: Locale[] = ["kr", "ru", "uz", "en"];

export const localeNames: Record<Locale, string> = {
	kr: "한국어",
	ru: "Русский",
	uz: "O‘zbekcha",
	en: "enlish",
};

export const localeShort: Record<Locale, string> = {
	kr: "KR",
	ru: "RU",
	uz: "UZ",
	en: "EN",
};

/* ============================= */
/*         COMPONENT             */
/* ============================= */

export default function LanguageSwitcher() {
	const navigate = useNavigate();
	const location = useLocation();
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	/* -------- Detect Current Locale From URL -------- */

	const currentLocale = useMemo<Locale>(() => {
		const firstSegment = location.pathname.split("/")[1] as Locale;
		return locales.includes(firstSegment) ? firstSegment : "en";
	}, [location.pathname]);

	/* -------- Auto Redirect To Saved Locale -------- */

	useEffect(() => {
		const savedLocale = localStorage.getItem("locale") as Locale | null;
		const firstSegment = location.pathname.split("/")[1] as Locale;

		if (!locales.includes(firstSegment) && savedLocale) {
			navigate(`/${savedLocale}${location.pathname}`, { replace: true });
		}
	}, []);

	/* -------- Change Locale -------- */

	const handleLocaleChange = (newLocale: Locale) => {
		const segments = location.pathname.split("/").filter(Boolean);

		if (locales.includes(segments[0] as Locale)) {
			segments[0] = newLocale;
		} else {
			segments.unshift(newLocale);
		}

		const newPath = `/${segments.join("/")}`;

		localStorage.setItem("locale", newLocale);
		navigate(newPath);
		setIsOpen(false);
	};

	/* -------- Close On Outside Click -------- */

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	/* ============================= */
	/*              UI               */
	/* ============================= */

	const CurrentFlag = FlagComponents[currentLocale];

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className={`
  flex text-white items-center gap-2 px-3 py-2 rounded-lg
  border border-white/20
  text-sm font-medium transition-all duration-200          
  hover:bg-gray-200 hover:text-black 
  focus:outline-none focus:ring-2 focus:ring-blue-500
`}
				aria-label="Select language"
				aria-expanded={isOpen}
			>
				{/* Flag */}
				<CurrentFlag className="w-5 h-4 rounded-sm" />
				<span className="font-semibold">{localeShort[currentLocale]}</span>

				<ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
			</button>

			{isOpen && (
				<div
					className="
            absolute right-0 top-full mt-2 py-2 w-44
            bg-white rounded-lg shadow-lg border border-gray-200
            z-50
          "
				>
					{locales.map((loc) => {
						const Flag = FlagComponents[loc];

						return (
							<button
								key={loc}
								onClick={() => handleLocaleChange(loc)}
								className={`
                  w-full flex border-b items-center gap-3 px-4 py-2 text-sm text-left
                  transition-colors duration-150
                  ${currentLocale === loc ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100 text-gray-700"}
                `}
							>
								<Flag className="w-5 h-4 rounded-sm" />
								{localeNames[loc]}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

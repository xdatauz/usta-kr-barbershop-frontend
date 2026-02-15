import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FlagComponents } from "../../ui/Flags";
import i18n from "../config/i18n";

/* ============================= */
/*           LOCALES             */
/* ============================= */

export type Locale = "kr" | "ru" | "uz" | "en";

export const locales: Locale[] = ["kr", "ru", "uz", "en"];

export const localeNames: Record<Locale, string> = {
	kr: "한국어",
	ru: "Русский",
	uz: "O‘zbekcha",
	en: "English",
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
	const { t } = useTranslation();
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	/* -------- Detect Current Locale From URL -------- */

	const currentLocale = useMemo<Locale>(() => {
		const firstSegment = location.pathname.split("/")[1] as Locale;
		return locales.includes(firstSegment) ? firstSegment : "uz";
	}, [location.pathname]);

	useEffect(() => {
		if (i18n.resolvedLanguage !== currentLocale) {
			void i18n.changeLanguage(currentLocale);
		}
	}, [currentLocale]);

	/* -------- Change Locale -------- */

	const handleLocaleChange = (newLocale: Locale) => {
		const segments = location.pathname.split("/").filter(Boolean);

		if (locales.includes(segments[0] as Locale)) {
			segments[0] = newLocale;
		} else {
			segments.unshift(newLocale);
		}

		const newPath = `/${segments.join("/")}`;

		void i18n.changeLanguage(newLocale);
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
  flex items-center gap-2 rounded-lg px-3 py-2
  border border-slate-300 text-slate-700
  text-sm font-medium transition-all duration-200          
  hover:border-slate-500 hover:bg-slate-100
  focus:outline-none focus:ring-2 focus:ring-emerald-500/40
  dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-900
`}
				aria-label={t("language.select")}
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
            rounded-lg border border-slate-300 bg-white shadow-lg
            dark:border-slate-700 dark:bg-slate-900
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
                  ${currentLocale === loc ? "bg-emerald-100 text-emerald-700 font-medium dark:bg-emerald-500/20 dark:text-emerald-300" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"}
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

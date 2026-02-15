import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
	const { i18n } = useTranslation();

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
		localStorage.setItem("i18nextLng", lng);
	};

	const languages = [
		{ code: "uz", label: "UZ" },
		{ code: "kr", label: "KR" },
		{ code: "ru", label: "RU" },
		{ code: "en", label: "EN" },
	];

	return (
		<div className="flex items-center gap-2">
			{languages.map((lang) => (
				<button
					key={lang.code}
					onClick={() => changeLanguage(lang.code)}
					className={`px-2 py-1 rounded text-sm font-medium transition ${
						i18n.resolvedLanguage === lang.code ? "bg-green-700 text-white" : "bg-gray-200 hover:bg-green-200"
					}`}
				>
					{lang.label}
				</button>
			))}
		</div>
	);
};

export default LanguageSwitcher;

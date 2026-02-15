import { type ReactNode, useState, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../components/shared/config/i18n";


interface AppProvidersProps {
	children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

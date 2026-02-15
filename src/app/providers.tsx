import { type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../components/shared/config/i18n";
import { AuthProvider } from "../context/auth/auth-provider";


interface AppProvidersProps {
	children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
	return (
		<I18nextProvider i18n={i18n}>
			<AuthProvider>{children}</AuthProvider>
		</I18nextProvider>
	);
};

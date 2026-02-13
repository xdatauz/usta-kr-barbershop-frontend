import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: { welcome: "Welcome!" } },
		uz: { translation: { welcome: "Xush kelibsiz!" } },
		kr: { translation: { welcome: "Xush kelibsiz!" } },
	},
	lng: "en",
	fallbackLng: "en",
	interpolation: { escapeValue: false },
});

export default i18n;

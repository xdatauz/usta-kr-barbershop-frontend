import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import uz from "../locales/uz/translation.json";
import en from "../locales/en/translation.json";
import ru from "../locales/ru/translation.json";
import kr from "../locales/kr/translation.json";

const resources = {
	uz: { translation: uz },
	en: { translation: en },
	ru: { translation: ru },
	kr: { translation: kr },
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "uz",
		lng: "uz",
		debug: false,
		initImmediate: false,
		load: "currentOnly",
		supportedLngs: ["uz", "kr", "ru", "en"],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["path"],
			lookupFromPathIndex: 0,
		},
		react: {
			useSuspense: false,
		},
	});

export default i18n;

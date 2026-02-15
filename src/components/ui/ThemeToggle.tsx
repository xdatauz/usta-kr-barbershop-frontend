import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/theme/theme-provider";
import { useTranslation } from "react-i18next";

interface ThemeToggleProps {
	isScrolled?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isScrolled = true }) => {
	const { theme, toggleTheme } = useTheme();
	const { t } = useTranslation();

	return (
		<button
			onClick={toggleTheme}
			className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
				isScrolled
					? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
					: "bg-white/10 hover:bg-white/20"
			}`}
			aria-label={theme === "light" ? t("theme.switchToDark") : t("theme.switchToLight")}
		>
			<motion.div initial={false} animate={{ rotate: theme === "dark" ? 180 : 0 }} transition={{ duration: 0.3 }}>
				{theme === "light" ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-emerald-300" />}
			</motion.div>
		</button>
	);
};

import React, { useState, useEffect } from "react";

export const ThemeToggle = () => {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	return (
		<button
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
		>
			Toggle Theme
		</button>
	);
};

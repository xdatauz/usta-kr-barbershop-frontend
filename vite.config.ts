import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
	plugins: [react(), svgr()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"react-vendor": ["react", "react-dom", "react-router-dom"],
					query: ["@tanstack/react-query", "axios"],
					i18n: ["i18next", "react-i18next", "i18next-browser-languagedetector", "i18next-http-backend"],
					motion: ["framer-motion"],
					forms: ["react-hook-form", "@hookform/resolvers", "zod"],
				},
			},
		},
		chunkSizeWarningLimit: 1000,
	},
});

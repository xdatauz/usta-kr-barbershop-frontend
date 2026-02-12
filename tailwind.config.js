/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{ts,tsx}",
		"./node_modules/shadcn-ui/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: "class", // enables dark mode with 'dark' class
	theme: {
		extend: {
			screens: {
				xsm: { max: "240px" },
				mnsm: "241px",
				sm: "640px",
				lg: "992px",
				xl: "1024px",
				"2xl": "1280px",
				"3xl": "1536px",
				"4xl": "1920px",
				"5xl": "2560px",
				"6xl": "3840px",
			},

			fontSize: {
				xxsm: "0.75rem",
			},
			colors: {},
			width: {
				width: "1200px",
			},
		},
	},
	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

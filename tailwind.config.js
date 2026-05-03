/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Montserrat Variable"', '"Montserrat"', "system-ui", "-apple-system", "sans-serif"],
			},
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
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				card: {
					DEFAULT: "var(--card)",
					foreground: "var(--card-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				primary: {
					DEFAULT: "var(--primary)",
					foreground: "var(--primary-foreground)",
					hover: "var(--primary-hover)",
					light: "var(--primary-light)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					foreground: "var(--muted-foreground)",
				},
				accent: {
					DEFAULT: "var(--accent)",
					foreground: "var(--accent-foreground)",
				},
				destructive: {
					DEFAULT: "var(--destructive)",
				},
				success: "var(--success)",
				warning: "var(--warning)",
				info: "var(--info)",
				border: "var(--border)",
				input: {
					DEFAULT: "var(--input)",
					bg: "var(--input-bg)",
					border: "var(--input-border)",
					focus: "var(--input-focus)",
				},
				ring: "var(--ring)",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			width: {
				width: "1200px",
			},
		},
	},
	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography"), require("tailwindcss-animate")],
};

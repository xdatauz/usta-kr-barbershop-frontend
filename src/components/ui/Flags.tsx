import React from "react";

/* ============================= */
/*           TYPES               */
/* ============================= */

export type Locale = "kr" | "ru" | "uz" | "en";

interface FlagProps {
	className?: string;
}

/* ============================= */
/*         UZBEKISTAN 🇺🇿         */
/* ============================= */

export const UzbekistanFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => (
	<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
		<path fill="#1eb53a" d="M0 320h640v160H0z" />
		<path fill="#0099b5" d="M0 0h640v160H0z" />
		<path fill="#ce1126" d="M0 153.6h640v172.8H0z" />
		<path fill="#fff" d="M0 163.2h640v153.6H0z" />
		<circle cx="134" cy="80" r="40" fill="#fff" />
		<circle cx="154" cy="80" r="32" fill="#0099b5" />
	</svg>
);

/* ============================= */
/*            RUSSIA 🇷🇺          */
/* ============================= */

export const RussiaFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => (
	<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
		<path fill="#fff" d="M0 0h640v160H0z" />
		<path fill="#0039a6" d="M0 160h640v160H0z" />
		<path fill="#d52b1e" d="M0 320h640v160H0z" />
	</svg>
);

/* ============================= */
/*          KOREA 🇰🇷             */
/* ============================= */

export const KoreaFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => (
	<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
		{/* Background */}
		<rect width="640" height="480" fill="#ffffff" />

		{/* Taegeuk (Yin-Yang) */}
		<g transform="translate(320 240)">
			<circle r="90" fill="#cd2e3a" />
			<path
				d="M0,-90
           A90,90 0 0,1 0,90
           A45,45 0 0,0 0,-90"
				fill="#0047a0"
			/>
			<path
				d="M0,90
           A90,90 0 0,1 0,-90
           A45,45 0 0,0 0,90"
				fill="#cd2e3a"
			/>
		</g>

		{/* Trigrams */}

		{/* Top Left ☰ */}
		<g transform="translate(110 90) rotate(-30)">
			<rect width="100" height="12" fill="#000" />
			<rect y="24" width="100" height="12" fill="#000" />
			<rect y="48" width="100" height="12" fill="#000" />
		</g>

		{/* Bottom Right ☷ */}
		<g transform="translate(430 330) rotate(-30)">
			<rect width="100" height="12" fill="#000" />
			<rect y="24" width="100" height="12" fill="#000" />
			<rect y="48" width="100" height="12" fill="#000" />
		</g>

		{/* Top Right ☵ */}
		<g transform="translate(430 90) rotate(30)">
			<rect width="100" height="12" fill="#000" />
			<rect y="24" width="100" height="12" fill="#000" />
			<rect y="48" width="100" height="12" fill="#000" />
		</g>

		{/* Bottom Left ☲ */}
		<g transform="translate(110 330) rotate(30)">
			<rect width="100" height="12" fill="#000" />
			<rect y="24" width="100" height="12" fill="#000" />
			<rect y="48" width="100" height="12" fill="#000" />
		</g>
	</svg>
);

/* ============================= */
/*         UNITED KINGDOM 🇬🇧     */
/* ============================= */

export const UKFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => (
	<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
		<path fill="#012169" d="M0 0h640v480H0z" />
		<path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
		<path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
	</svg>
);

/* ============================= */
/*        FLAG MAP EXPORT        */
/* ============================= */

export const FlagComponents: Record<Locale, React.FC<FlagProps>> = {
	uz: UzbekistanFlag,
	ru: RussiaFlag,
	kr: KoreaFlag,
	en: UKFlag,
};

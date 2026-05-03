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

export const KoreaFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => {
	// Trigram layout — each bar is 30 wide; broken bars use a 6-unit gap split.
	// Bar width 30, height 5, gap between rows 9, broken-bar split 12.
	const SolidBar = ({ y }: { y: number }) => (
		<rect x="-15" y={y} width="30" height="5" fill="#000" />
	);
	const BrokenBar = ({ y }: { y: number }) => (
		<>
			<rect x="-15" y={y} width="12" height="5" fill="#000" />
			<rect x="3" y={y} width="12" height="5" fill="#000" />
		</>
	);
	return (
		<svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
			{/* Background */}
			<rect width="640" height="480" fill="#ffffff" />

			{/* Taegeuk (Yin-Yang) — rotated -56.31° to align with diagonal */}
			<g transform="translate(320 240) rotate(-56.31)">
				<circle r="80" fill="#0047a0" />
				<path d="M0,-80 A80,80 0 0,1 0,80 A40,40 0 0,1 0,0 A40,40 0 0,0 0,-80z" fill="#cd2e3a" />
			</g>

			{/* Trigrams — placed on the corners along the same diagonal axis.
			    Each <g> is rotated so the bars sit perpendicular to the line
			    between the trigram and the centre, matching the spec. */}

			{/* Top-Left  ☰ Heaven (3 solid) */}
			<g transform="translate(128 96) rotate(-56.31)">
				<SolidBar y={-9} />
				<SolidBar y={0} />
				<SolidBar y={9} />
			</g>

			{/* Top-Right ☵ Water (solid, broken, solid) */}
			<g transform="translate(512 96) rotate(56.31)">
				<SolidBar y={-9} />
				<BrokenBar y={0} />
				<SolidBar y={9} />
			</g>

			{/* Bottom-Left ☲ Fire (broken, solid, broken) */}
			<g transform="translate(128 384) rotate(56.31)">
				<BrokenBar y={-9} />
				<SolidBar y={0} />
				<BrokenBar y={9} />
			</g>

			{/* Bottom-Right ☷ Earth (3 broken) */}
			<g transform="translate(512 384) rotate(-56.31)">
				<BrokenBar y={-9} />
				<BrokenBar y={0} />
				<BrokenBar y={9} />
			</g>
		</svg>
	);
};

/* ============================= */
/*         UNITED KINGDOM 🇬🇧     */
/* ============================= */

export const UKFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => (
	<svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
		<clipPath id="uk-clip-flag">
			<path d="M0,0 v30 h60 v-30 z" />
		</clipPath>
		<clipPath id="uk-clip-saltire">
			<path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
		</clipPath>
		<g clipPath="url(#uk-clip-flag)">
			{/* Background — Royal Blue */}
			<path d="M0,0 v30 h60 v-30 z" fill="#012169" />
			{/* St. Andrew's Cross (white diagonals) */}
			<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
			{/* St. Patrick's Cross (red diagonals, clipped to half) */}
			<path
				d="M0,0 L60,30 M60,0 L0,30"
				clipPath="url(#uk-clip-saltire)"
				stroke="#C8102E"
				strokeWidth="4"
			/>
			{/* St. George's Cross (white +) */}
			<path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
			{/* St. George's Cross (red +) */}
			<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
		</g>
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

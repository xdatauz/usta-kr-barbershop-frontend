export const BARBER_IDS = ["jamshid", "sardor", "aziz", "doston", "islom"] as const;

export type BarberId = (typeof BARBER_IDS)[number];

export interface BarberMedia {
	id: BarberId;
	image: string;
}

export const BARBER_MEDIA: BarberMedia[] = [
	{ id: "jamshid", image: "/images/barbers/1.webp" },
	{ id: "sardor", image: "/images/barbers/2.webp" },
	{ id: "aziz", image: "/images/barbers/3.webp" },
	{ id: "doston", image: "/images/barbers/4.webp" },
	{ id: "islom", image: "/images/barbers/5.webp" },
];

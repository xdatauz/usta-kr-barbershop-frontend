export const CONTACT = {
	phones: [
		{ display: "053-813-5515", tel: "+82538135515" },
		{ display: "010-4619-5515", tel: "+821046195515" },
	],
	address: {
		street: "둥지로 84-1",
		city: "경산시",
		region: "경상북도",
		country: "KR",
	},
	// TODO: aniq koordinatalar — hozir 경산시 taxminiy markaz
	geo: {
		latitude: 35.8251,
		longitude: 128.7411,
	},
	siteUrl: "https://ustabarber.pro",
	siteName: "Usta Barber",
	instagram: "https://www.instagram.com/usta.barbershop",
	telegram: "https://t.me/usta_2019",
} as const;

export type ContactInfo = typeof CONTACT;

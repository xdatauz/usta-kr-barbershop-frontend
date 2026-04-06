import { z } from "zod";

/**
 * Korean phone number format: 010-1234-5678 or 01012345678
 * Accepts both formatted (with hyphens) and raw digits.
 */
const koreanPhoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;

export const bookingFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "bookingPage.form.validation.nameRequired"),
	phone: z
		.string()
		.trim()
		.min(1, "bookingPage.form.validation.phoneRequired")
		.regex(koreanPhoneRegex, "bookingPage.form.validation.phoneInvalid"),
	barberId: z
		.string()
		.min(1, "bookingPage.form.validation.barberRequired"),
	style: z
		.string()
		.min(1, "bookingPage.form.validation.serviceRequired"),
	date: z
		.string()
		.min(1, "bookingPage.form.validation.dateRequired"),
	time: z
		.string()
		.min(1, "bookingPage.form.validation.timeRequired"),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

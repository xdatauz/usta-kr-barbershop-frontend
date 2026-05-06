import { z } from "zod";

/**
 * Phone format: accept Uzbek (+998…) and Korean (010-…) variants, with or
 * without spaces, dashes, or parentheses. We just require 9–15 digits total
 * and an optional leading "+".
 */
const phoneRegex = /^\+?[\d\s().-]{9,20}$/;

export const bookingFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "bookingPage.form.validation.nameRequired"),
	phone: z
		.string()
		.trim()
		.min(1, "bookingPage.form.validation.phoneRequired")
		.regex(phoneRegex, "bookingPage.form.validation.phoneInvalid"),
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

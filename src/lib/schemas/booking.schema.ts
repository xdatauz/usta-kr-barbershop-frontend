import { z } from "zod";

/**
 * Korean phone format: 010-1234-5678 / 01012345678 / 011-123-4567, etc.
 * Mobile prefixes 010, 011, 016, 017, 018, 019 are accepted. Dashes and
 * spaces are optional. International form `+82 10-1234-5678` is also
 * accepted so re-edited values from the server still pass validation.
 */
const phoneRegex = /^(\+?82[\s-]?)?0?1[016789][\s-]?\d{3,4}[\s-]?\d{4}$/;

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

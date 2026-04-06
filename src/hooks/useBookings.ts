import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getMyBookingsApi,
	getBookingSlotsApi,
	createBookingApi,
	cancelMyBookingApi,
	type BookingPayload,
} from "../lib/api/bookings";

export const useMyBookings = () =>
	useQuery({
		queryKey: ["bookings", "me"],
		queryFn: getMyBookingsApi,
	});

export const useBookingSlots = (barberId: string, date: string) =>
	useQuery({
		queryKey: ["bookings", "slots", barberId, date],
		queryFn: () => getBookingSlotsApi(barberId, date),
		enabled: !!barberId && !!date,
	});

export const useCreateBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: BookingPayload) => createBookingApi(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
		},
	});
};

export const useCancelBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => cancelMyBookingApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
		},
	});
};

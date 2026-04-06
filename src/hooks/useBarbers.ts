import { useQuery } from "@tanstack/react-query";
import { getBarbersApi, getBarberApi, getBarberCommentsApi } from "../lib/api/barbers";

export const useBarbers = () =>
	useQuery({
		queryKey: ["barbers"],
		queryFn: getBarbersApi,
	});

export const useBarber = (id: string) =>
	useQuery({
		queryKey: ["barbers", id],
		queryFn: () => getBarberApi(id),
		enabled: !!id,
	});

export const useBarberComments = (id: string) =>
	useQuery({
		queryKey: ["barbers", id, "comments"],
		queryFn: () => getBarberCommentsApi(id),
		enabled: !!id,
	});

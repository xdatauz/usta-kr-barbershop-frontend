import { useQuery } from "@tanstack/react-query";
import { getPublicServicesApi, getServicesApi, getServiceApi } from "../lib/api/services";

export const usePublicServices = () =>
	useQuery({
		queryKey: ["services", "public"],
		queryFn: getPublicServicesApi,
	});

export const useServices = () =>
	useQuery({
		queryKey: ["services"],
		queryFn: getServicesApi,
	});

export const useService = (id: number) =>
	useQuery({
		queryKey: ["services", id],
		queryFn: () => getServiceApi(id),
		enabled: id > 0,
	});

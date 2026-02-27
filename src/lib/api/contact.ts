import { apiRequest } from "./client";

export interface ContactPayload {
	name: string;
	phone: string;
	message: string;
}

export const submitContactApi = async (payload: ContactPayload) => {
	return apiRequest("/contact", {
		method: "POST",
		body: payload,
	});
};

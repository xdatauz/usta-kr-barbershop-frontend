import api from "./client";

export interface ContactPayload {
	name: string;
	phone: string;
	message: string;
}

export const submitContactApi = async (payload: ContactPayload) => {
	const { data } = await api.post("/contact", payload);
	return data;
};

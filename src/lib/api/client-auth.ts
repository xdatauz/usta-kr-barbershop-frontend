import { apiRequest, clearStoredTokens, setAccessToken } from "./client";

export interface ClientUser {
	id: string;
	name: string;
	phone: string;
}

export interface ClientAuthResult {
	client: ClientUser;
	accessToken: string;
}

const normalizeClient = (raw: unknown): ClientUser | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;
	const rawId = src.id;
	const id = typeof rawId === "number" ? String(rawId) : typeof rawId === "string" ? rawId : null;
	if (!id) return null;
	return {
		id,
		name: typeof src.name === "string" ? src.name : "",
		phone: typeof src.phone === "string" ? src.phone : "",
	};
};

const normalizeClientAuth = (payload: Record<string, unknown>): ClientAuthResult => {
	const accessToken = typeof payload.accessToken === "string" ? payload.accessToken : null;
	const client = normalizeClient(payload.client ?? payload);
	if (!client || !accessToken) throw new Error("CLIENT_AUTH_RESPONSE_INVALID");
	return { client, accessToken };
};

/** POST /client-auth/register — phone + optional name, no password */
export const registerClientApi = async (payload: { phone: string; fullName?: string }): Promise<ClientAuthResult> => {
	const response = await apiRequest<Record<string, unknown>>("/client-auth/register", {
		method: "POST",
		body: payload,
	});
	const result = normalizeClientAuth(response);
	setAccessToken(result.accessToken);
	return result;
};

/** POST /client-auth/login — phone only, no password */
export const loginClientApi = async (payload: { phone: string }): Promise<ClientAuthResult> => {
	const response = await apiRequest<Record<string, unknown>>("/client-auth/login", {
		method: "POST",
		body: payload,
	});
	const result = normalizeClientAuth(response);
	setAccessToken(result.accessToken);
	return result;
};

/** GET /client-auth/me */
export const getClientMeApi = async (): Promise<ClientUser> => {
	const response = await apiRequest<unknown>("/client-auth/me", { method: "GET", auth: true });
	const src = response as Record<string, unknown>;
	const client = normalizeClient(src.client ?? response);
	if (!client) throw new Error("CLIENT_PROFILE_INVALID");
	return client;
};

export const clientLogout = (): void => {
	clearStoredTokens();
};

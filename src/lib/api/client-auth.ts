import api, { clearStoredTokens, setAccessToken } from "./client";
import { normalizeId, normalizeString } from "./normalizers";

export interface ClientUser {
	id: string;
	name: string;
	phone: string;
	userType?: string;
}

export interface ClientAuthResult {
	client: ClientUser;
	accessToken: string;
}

const normalizeClient = (raw: unknown): ClientUser | null => {
	if (!raw || typeof raw !== "object") return null;
	const src = raw as Record<string, unknown>;
	const id = normalizeId(src.id);
	if (!id) return null;
	return {
		id,
		name: normalizeString(src.name),
		phone: normalizeString(src.phone),
		userType: typeof src.userType === "string" ? src.userType : undefined,
	};
};

const normalizeClientAuth = (payload: Record<string, unknown>): ClientAuthResult => {
	const accessToken = typeof payload.accessToken === "string" ? payload.accessToken : null;
	const client = normalizeClient(payload.client ?? payload);
	if (!client || !accessToken) throw new Error("CLIENT_AUTH_RESPONSE_INVALID");
	return { client, accessToken };
};

/** POST /client-auth/register — phone + optional name + password */
export const registerClientApi = async (payload: { phone: string; fullName?: string; password: string }): Promise<ClientAuthResult> => {
	const { data } = await api.post<Record<string, unknown>>("/client-auth/register", payload);
	const result = normalizeClientAuth(data);
	setAccessToken(result.accessToken);
	return result;
};

/** POST /client-auth/login — phone + password */
export const loginClientApi = async (payload: { phone: string; password: string }): Promise<ClientAuthResult> => {
	const { data } = await api.post<Record<string, unknown>>("/client-auth/login", payload);
	const result = normalizeClientAuth(data);
	setAccessToken(result.accessToken);
	return result;
};

/** GET /client-auth/me */
export const getClientMeApi = async (): Promise<ClientUser> => {
	const { data } = await api.get<unknown>("/client-auth/me");
	const src = data as Record<string, unknown>;
	const client = normalizeClient(src.client ?? data);
	if (!client) throw new Error("CLIENT_PROFILE_INVALID");
	return client;
};

export const clientLogout = (): void => {
	clearStoredTokens();
};

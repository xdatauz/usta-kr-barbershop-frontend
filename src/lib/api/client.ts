export interface ApiErrorPayload {
	code?: string;
	message?: string;
	fields?: Record<string, string>;
}

export class ApiError extends Error {
	status: number;
	code?: string;
	fields?: Record<string, string>;
	raw?: unknown;

	constructor(params: { message: string; status: number; code?: string; fields?: Record<string, string>; raw?: unknown }) {
		super(params.message);
		this.name = "ApiError";
		this.status = params.status;
		this.code = params.code;
		this.fields = params.fields;
		this.raw = params.raw;
	}
}

export const ACCESS_TOKEN_KEY = "usta_access_token";
export const REFRESH_TOKEN_KEY = "usta_refresh_token";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";
const API_PREFIX = `${API_BASE_URL}/api/v1`;
let refreshRequest: Promise<string | null> | null = null;

export const getApiUrl = (path: string): string => {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return `${API_PREFIX}${normalized}`;
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem("access_token");
export const setAccessToken = (token: string | null) => {
	if (!token) {
		localStorage.removeItem(ACCESS_TOKEN_KEY);
		return;
	}
	localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string | null) => {
	if (!token) {
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		return;
	}
	localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearStoredTokens = () => {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	localStorage.removeItem("access_token");
};

const tryParseJson = async (response: Response): Promise<unknown> => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};

const extractApiError = (status: number, payload: unknown): ApiError => {
	if (payload && typeof payload === "object") {
		const objectPayload = payload as { error?: ApiErrorPayload; message?: string };
		const message = objectPayload.error?.message || objectPayload.message || `Request failed with status ${status}`;
		return new ApiError({
			status,
			message,
			code: objectPayload.error?.code,
			fields: objectPayload.error?.fields,
			raw: payload,
		});
	}

	return new ApiError({
		status,
		message: `Request failed with status ${status}`,
		raw: payload,
	});
};

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
	auth?: boolean;
	body?: unknown;
	skipAuthRefresh?: boolean;
}

const resolveData = <T>(payload: unknown): T => {
	if (payload && typeof payload === "object" && "data" in payload) {
		return (payload as { data: T }).data;
	}

	return payload as T;
};

const normalizeRefreshPayload = (payload: unknown): { accessToken: string | null; refreshToken: string | null } => {
	const data = resolveData<unknown>(payload);
	if (!data || typeof data !== "object") {
		return {
			accessToken: null,
			refreshToken: null,
		};
	}

	const source = data as { accessToken?: unknown; refreshToken?: unknown; token?: unknown };
	return {
		accessToken:
			typeof source.accessToken === "string"
				? source.accessToken
				: typeof source.token === "string"
					? source.token
					: null,
		refreshToken: typeof source.refreshToken === "string" ? source.refreshToken : null,
	};
};

const requestAccessTokenRefresh = async (): Promise<string | null> => {
	const refreshToken = getRefreshToken();
	if (!refreshToken) {
		clearStoredTokens();
		return null;
	}

	const response = await fetch(getApiUrl("/auth/refresh"), {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ refreshToken }),
		credentials: "include",
	});

	const payload = await tryParseJson(response);
	if (!response.ok) {
		clearStoredTokens();
		throw extractApiError(response.status, payload);
	}

	const nextTokens = normalizeRefreshPayload(payload);
	if (!nextTokens.accessToken) {
		clearStoredTokens();
		return null;
	}

	setAccessToken(nextTokens.accessToken);
	setRefreshToken(nextTokens.refreshToken ?? refreshToken);
	return nextTokens.accessToken;
};

const refreshAccessToken = async (): Promise<string | null> => {
	if (!refreshRequest) {
		refreshRequest = requestAccessTokenRefresh().finally(() => {
			refreshRequest = null;
		});
	}

	return refreshRequest;
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
	const { auth = false, headers, body, skipAuthRefresh = false, ...rest } = options;
	const isBodyFormData = body instanceof FormData;

	const sendRequest = async (tokenOverride?: string) => {
		const requestHeaders = new Headers(headers || {});

		if (!requestHeaders.has("Accept")) {
			requestHeaders.set("Accept", "application/json");
		}

		if (body !== undefined && !isBodyFormData && !requestHeaders.has("Content-Type")) {
			requestHeaders.set("Content-Type", "application/json");
		}

		if (auth) {
			const token = tokenOverride ?? getAccessToken();
			if (token) {
				requestHeaders.set("Authorization", `Bearer ${token}`);
			}
		}

		const response = await fetch(getApiUrl(path), {
			...rest,
			headers: requestHeaders,
			body: body === undefined ? undefined : isBodyFormData ? body : JSON.stringify(body),
			credentials: "include",
		});

		const payload = await tryParseJson(response);
		return { response, payload };
	};

	let { response, payload } = await sendRequest();

	if (auth && response.status === 401 && !skipAuthRefresh && !path.includes("/auth/refresh")) {
		try {
			const token = await refreshAccessToken();
			if (token) {
				const retryResult = await sendRequest(token);
				response = retryResult.response;
				payload = retryResult.payload;
			}
		} catch {
			clearStoredTokens();
		}
	}

	if (!response.ok) {
		throw extractApiError(response.status, payload);
	}

	return resolveData<T>(payload);
};

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

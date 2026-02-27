import type { AuthUser, UserType } from "../../context/auth/auth-provider";
import { apiRequest, clearStoredTokens, setAccessToken, setRefreshToken } from "./client";

export interface AuthRequestPayload {
	email: string;
	password: string;
}

export interface SignupRequestPayload extends AuthRequestPayload {
	name: string;
	userType?: UserType;
}

interface AuthResponseShape {
	accessToken?: string;
	refreshToken?: string;
	token?: string;
	user?: AuthUser;
	id?: string;
	name?: string;
	email?: string;
	userType?: UserType;
	image?: string | null;
}

export interface AuthResult {
	user: AuthUser;
	accessToken: string | null;
	refreshToken: string | null;
}

const normalizeUser = (raw: AuthResponseShape | AuthUser | undefined): AuthUser | null => {
	if (!raw || typeof raw !== "object") {
		return null;
	}

	const candidate = raw as Partial<AuthUser>;
	if (typeof candidate.id !== "string" || typeof candidate.name !== "string" || typeof candidate.email !== "string") {
		return null;
	}

	const role = candidate.userType === "ADMIN" || candidate.userType === "BARBER" || candidate.userType === "USER" ? candidate.userType : "USER";

	return {
		id: candidate.id,
		name: candidate.name,
		email: candidate.email,
		userType: role,
		image: candidate.image ?? null,
	};
};

const normalizeAuthResponse = (payload: AuthResponseShape): AuthResult => {
	const accessToken = payload.accessToken || payload.token || null;
	const refreshToken = payload.refreshToken || null;
	const user = normalizeUser(payload.user || payload);

	if (!user) {
		throw new Error("AUTH_RESPONSE_INVALID");
	}

	return {
		user,
		accessToken,
		refreshToken,
	};
};

const persistTokens = (result: AuthResult) => {
	setAccessToken(result.accessToken);
	setRefreshToken(result.refreshToken);
};

export const loginApi = async (payload: AuthRequestPayload): Promise<AuthResult> => {
	const response = await apiRequest<AuthResponseShape>("/auth/login", {
		method: "POST",
		body: payload,
	});
	const result = normalizeAuthResponse(response);
	persistTokens(result);
	return result;
};

export const signupApi = async (payload: SignupRequestPayload): Promise<AuthResult> => {
	const response = await apiRequest<AuthResponseShape>("/auth/signup", {
		method: "POST",
		body: payload,
	});
	const result = normalizeAuthResponse(response);
	persistTokens(result);
	return result;
};

export const getMeApi = async (): Promise<AuthUser> => {
	const response = await apiRequest<AuthResponseShape | AuthUser>("/auth/me", {
		method: "GET",
		auth: true,
	});

	const user = normalizeUser((response as AuthResponseShape).user || (response as AuthUser));

	if (!user) {
		throw new Error("AUTH_PROFILE_INVALID");
	}

	return user;
};

export const logoutApi = async (): Promise<void> => {
	try {
		await apiRequest("/auth/logout", {
			method: "POST",
			auth: true,
		});
	} finally {
		clearStoredTokens();
	}
};

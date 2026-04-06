import type { AuthUser } from "../../context/auth/auth-provider";
import { StaffRole } from "../enums/staff-role.enum";
import api, { clearStoredTokens, setAccessToken, setRefreshToken } from "./client";
import { normalizeId, normalizeString } from "./normalizers";

export interface AuthRequestPayload {
	/** email or phone — sent as `identifier` to backend */
	email: string;
	password: string;
}

export interface SignupRequestPayload {
	name: string;
	email: string;
	password: string;
	userType?: StaffRole;
}

interface AuthResponseShape {
	accessToken?: string;
	refreshToken?: string;
	token?: string;
	user?: Record<string, unknown>;
	id?: string | number;
	name?: string;
	email?: string;
	userType?: string;
	role?: string;
	image?: string | null;
}

export interface AuthResult {
	user: AuthUser;
	accessToken: string | null;
	refreshToken: string | null;
}

const toUserType = (raw: unknown): StaffRole => {
	const map: Record<string, StaffRole> = {
		[StaffRole.ADMIN]: StaffRole.ADMIN,
		[StaffRole.BARBER]: StaffRole.BARBER,
		[StaffRole.HEAD_BARBER]: StaffRole.BARBER,
		[StaffRole.RECEPTION]: StaffRole.ADMIN,
		USER: StaffRole.BARBER,
		CLIENT: StaffRole.BARBER,
		FRONTEND_USER: StaffRole.BARBER,
	};
	return map[String(raw ?? "")] ?? StaffRole.BARBER;
};

const normalizeUser = (raw: unknown): AuthUser | null => {
	if (!raw || typeof raw !== "object") return null;

	const src = raw as Record<string, unknown>;
	const id = normalizeId(src.id);
	const name = typeof src.name === "string" ? src.name : null;
	const phone = typeof src.phone === "string" ? src.phone : typeof src.email === "string" ? src.email : null;

	if (!id || !name || !phone) return null;

	return {
		id,
		name,
		phone,
		userType: toUserType(src.userType ?? src.role),
		image: normalizeString(src.image, "") || null,
	};
};

const normalizeAuthResponse = (payload: AuthResponseShape): AuthResult => {
	const accessToken = payload.accessToken || payload.token || null;
	const refreshToken = payload.refreshToken || null;
	const user = normalizeUser(payload.user ?? payload);

	if (!user) {
		throw new Error("AUTH_RESPONSE_INVALID");
	}

	return { user, accessToken, refreshToken };
};

const persistTokens = (result: AuthResult) => {
	setAccessToken(result.accessToken);
	setRefreshToken(result.refreshToken);
};

export const loginApi = async (payload: AuthRequestPayload): Promise<AuthResult> => {
	// Backend expects `identifier` (email or phone); we map `email` → `identifier`
	const { data } = await api.post<AuthResponseShape>("/auth/login", {
		email: payload.email,
		password: payload.password,
	});
	const result = normalizeAuthResponse(data);
	persistTokens(result);
	return result;
};

export const signupApi = async (payload: SignupRequestPayload): Promise<AuthResult> => {
	const { data } = await api.post<AuthResponseShape>("/auth/signup", payload);
	const result = normalizeAuthResponse(data);
	persistTokens(result);
	return result;
};

export const getMeApi = async (): Promise<AuthUser> => {
	const { data } = await api.get<unknown>("/auth/me");
	const src = data as Record<string, unknown>;
	const user = normalizeUser(src.user ?? data);

	if (!user) throw new Error("AUTH_PROFILE_INVALID");

	return user;
};

export const logoutApi = async (): Promise<void> => {
	try {
		await api.post("/auth/logout");
	} finally {
		clearStoredTokens();
	}
};

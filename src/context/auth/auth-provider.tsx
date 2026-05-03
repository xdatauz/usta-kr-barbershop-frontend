import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clientLogout, getClientMeApi, loginClientApi, registerClientApi } from "../../lib/api/client-auth";
import { clearStoredTokens, isApiError } from "../../lib/api/client";
import { StaffRole } from "../../lib/enums/staff-role.enum";

export type AuthUserType = StaffRole | "CLIENT";

export interface AuthUser {
	id: string;
	name: string;
	phone: string;
	userType: AuthUserType;
	image?: string | null;
}

interface AuthContextValue {
	currentUser: AuthUser | null;
	isAuthLoading: boolean;
	login: (payload: { phone: string; password: string }) => Promise<{ ok: boolean; error?: string; errorCode?: string }>;
	signup: (payload: { name: string; phone: string; password: string }) => Promise<{ ok: boolean; error?: string; errorCode?: string }>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = "usta_auth_user";

const VALID_USER_TYPES = new Set<AuthUserType>([
	StaffRole.ADMIN,
	StaffRole.BARBER,
	StaffRole.HEAD_BARBER,
	StaffRole.RECEPTION,
	"CLIENT",
]);

const normalizeUserType = (raw: unknown): AuthUserType => {
	if (typeof raw !== "string") return "CLIENT";
	const upper = raw.toUpperCase();
	if (VALID_USER_TYPES.has(upper as AuthUserType)) return upper as AuthUserType;
	return "CLIENT";
};

const clientToAuthUser = (client: { id: string; name: string; phone: string; userType?: string }): AuthUser => ({
	id: client.id,
	name: client.name,
	phone: client.phone,
	userType: normalizeUserType(client.userType),
	image: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
	const [isAuthLoading, setIsAuthLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();

	// restore cached user on mount
	useEffect(() => {
		const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
		if (!raw) return;
		try {
			const parsed = JSON.parse(raw) as Partial<AuthUser>;
			if (
				!parsed ||
				typeof parsed !== "object" ||
				typeof parsed.id !== "string" ||
				typeof parsed.name !== "string" ||
				typeof parsed.phone !== "string"
			) {
				localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
				return;
			}
			setCurrentUser({
				id: parsed.id,
				name: parsed.name,
				phone: parsed.phone,
				userType: normalizeUserType(parsed.userType),
				image: parsed.image ?? null,
			});
		} catch {
			localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
		}
	}, []);

	// verify token on mount
	useEffect(() => {
		const bootstrap = async () => {
			setIsAuthLoading(true);
			try {
				const client = await getClientMeApi();
				const user = clientToAuthUser(client);
				setCurrentUser(user);
				persistUser(user);
			} catch (error) {
				if (isApiError(error) && (error.status === 401 || error.status === 403)) {
					clearStoredTokens();
					setCurrentUser(null);
					persistUser(null);
				}
			} finally {
				setIsAuthLoading(false);
			}
		};
		void bootstrap();
	}, []);

	const persistUser = (user: AuthUser | null) => {
		if (!user) {
			localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
			return;
		}
		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
	};

	// Pull a stable error code so AuthModal can map it to a localised string.
	// Network/timeout errors don't have an HTTP status — surface them as
	// `NETWORK_ERROR` so the UI can show a clear "couldn't reach the server"
	// message instead of an English axios stack.
	const extractErrorCode = (error: unknown): string | undefined => {
		if (isApiError(error)) {
			if (error.code) return error.code;
			if (error.status === 409) return "CONFLICT";
			if (error.status === 401) return "INVALID_CREDENTIALS";
			if (error.status === 400) return "VALIDATION_ERROR";
			if (error.status >= 500) return "SERVER_ERROR";
			return "REQUEST_FAILED";
		}
		const e = error as { code?: string; message?: string } | null;
		if (e?.code === "ECONNABORTED" || e?.message?.toLowerCase().includes("timeout"))
			return "NETWORK_TIMEOUT";
		return "NETWORK_ERROR";
	};

	const login = async ({ phone, password }: { phone: string; password: string }) => {
		setIsAuthLoading(true);
		try {
			const result = await loginClientApi({ phone: phone.trim(), password });
			const user = clientToAuthUser(result.client);
			setCurrentUser(user);
			persistUser(user);
			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				errorCode: extractErrorCode(error),
				error: isApiError(error) ? error.message : undefined,
			};
		} finally {
			setIsAuthLoading(false);
		}
	};

	const signup = async ({ name, phone, password }: { name: string; phone: string; password: string }) => {
		setIsAuthLoading(true);
		try {
			const result = await registerClientApi({ fullName: name.trim(), phone: phone.trim(), password });
			const user = clientToAuthUser(result.client);
			setCurrentUser(user);
			persistUser(user);
			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				errorCode: extractErrorCode(error),
				error: isApiError(error) ? error.message : undefined,
			};
		} finally {
			setIsAuthLoading(false);
		}
	};

	const logout = () => {
		clientLogout();
		setCurrentUser(null);
		persistUser(null);
		queryClient.clear();
		const locale = location.pathname.split("/")[1] || "uz";
		navigate(`/${locale}`);
	};

	const value = useMemo(() => ({ currentUser, isAuthLoading, login, signup, logout }), [currentUser, isAuthLoading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};

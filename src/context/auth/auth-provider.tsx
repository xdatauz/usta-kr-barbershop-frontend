import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clientLogout, getClientMeApi, loginClientApi, registerClientApi } from "../../lib/api/client-auth";
import { clearStoredTokens, isApiError } from "../../lib/api/client";

export type UserType = "USER";

export interface AuthUser {
	id: string;
	name: string;
	phone: string;
	userType: UserType;
	image?: string | null;
}

interface AuthContextValue {
	currentUser: AuthUser | null;
	isAuthLoading: boolean;
	login: (payload: { phone: string }) => Promise<{ ok: boolean; error?: string }>;
	signup: (payload: { name: string; phone: string }) => Promise<{ ok: boolean; error?: string }>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = "usta_auth_user";

const clientToAuthUser = (client: { id: string; name: string; phone: string }): AuthUser => ({
	id: client.id,
	name: client.name,
	phone: client.phone,
	userType: "USER",
	image: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
	const [isAuthLoading, setIsAuthLoading] = useState(false);

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
			setCurrentUser({ id: parsed.id, name: parsed.name, phone: parsed.phone, userType: "USER", image: parsed.image ?? null });
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

	const login = async ({ phone }: { phone: string }) => {
		setIsAuthLoading(true);
		try {
			const result = await loginClientApi({ phone: phone.trim() });
			const user = clientToAuthUser(result.client);
			setCurrentUser(user);
			persistUser(user);
			return { ok: true };
		} catch (error) {
			const errorMessage = isApiError(error) ? error.message : undefined;
			return { ok: false, error: errorMessage };
		} finally {
			setIsAuthLoading(false);
		}
	};

	const signup = async ({ name, phone }: { name: string; phone: string }) => {
		setIsAuthLoading(true);
		try {
			const result = await registerClientApi({ fullName: name.trim(), phone: phone.trim() });
			const user = clientToAuthUser(result.client);
			setCurrentUser(user);
			persistUser(user);
			return { ok: true };
		} catch (error) {
			const errorMessage = isApiError(error) ? error.message : undefined;
			return { ok: false, error: errorMessage };
		} finally {
			setIsAuthLoading(false);
		}
	};

	const logout = () => {
		clientLogout();
		setCurrentUser(null);
		persistUser(null);
	};

	const value = useMemo(
		() => ({ currentUser, isAuthLoading, login, signup, logout }),
		[currentUser, isAuthLoading],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};

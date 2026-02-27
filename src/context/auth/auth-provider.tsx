import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getMeApi, loginApi, logoutApi, signupApi } from "../../lib/api/auth";
import { clearStoredTokens, isApiError } from "../../lib/api/client";

export const USER_TYPES = ["USER", "ADMIN", "BARBER"] as const;
export type UserType = (typeof USER_TYPES)[number];

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	userType: UserType;
	image?: string | null;
}

interface AuthContextValue {
	currentUser: AuthUser | null;
	isAuthLoading: boolean;
	login: (payload: { email: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
	signup: (payload: { name: string; email: string; password: string; userType?: UserType }) => Promise<{ ok: boolean; error?: string }>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = "usta_auth_user";

const isUserType = (value: unknown): value is UserType => typeof value === "string" && USER_TYPES.includes(value as UserType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
	const [isAuthLoading, setIsAuthLoading] = useState(false);

	useEffect(() => {
		const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
		if (!raw) {
			return;
		}

		try {
			const parsed = JSON.parse(raw) as Partial<AuthUser>;
			if (!parsed || typeof parsed !== "object") {
				localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
				return;
			}

			if (typeof parsed.id !== "string" || typeof parsed.name !== "string" || typeof parsed.email !== "string") {
				localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
				return;
			}

			const safeUser: AuthUser = {
				id: parsed.id,
				name: parsed.name,
				email: parsed.email,
				userType: isUserType(parsed.userType) ? parsed.userType : "USER",
				image: parsed.image ?? null,
			};

			setCurrentUser(safeUser);
		} catch {
			localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
		}
	}, []);

	useEffect(() => {
		const bootstrapAuth = async () => {
			setIsAuthLoading(true);
			try {
				const user = await getMeApi();
				setCurrentUser(user);
				persistUser(user);
			} catch {
				clearStoredTokens();
				setCurrentUser(null);
				persistUser(null);
			} finally {
				setIsAuthLoading(false);
			}
		};

		void bootstrapAuth();
	}, []);

	const persistUser = (user: AuthUser | null) => {
		if (!user) {
			localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
			return;
		}

		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
	};

	const login = async ({ email, password }: { email: string; password: string }) => {
		setIsAuthLoading(true);
		try {
			const result = await loginApi({
				email: email.trim(),
				password: password.trim(),
			});
			setCurrentUser(result.user);
			persistUser(result.user);
			return { ok: true };
		} catch (error) {
			const errorMessage = isApiError(error) ? error.message : undefined;
			return { ok: false, error: errorMessage };
		} finally {
			setIsAuthLoading(false);
		}
	};

	const signup = async ({
		name,
		email,
		password,
		userType = "USER",
	}: {
		name: string;
		email: string;
		password: string;
		userType?: UserType;
	}) => {
		setIsAuthLoading(true);
		try {
			const result = await signupApi({
				name: name.trim(),
				email: email.trim(),
				password: password.trim(),
				userType: isUserType(userType) ? userType : "USER",
			});
			setCurrentUser(result.user);
			persistUser(result.user);
			return { ok: true };
		} catch (error) {
			const errorMessage = isApiError(error) ? error.message : undefined;
			return { ok: false, error: errorMessage };
		} finally {
			setIsAuthLoading(false);
		}
	};

	const logout = async () => {
		setIsAuthLoading(true);
		try {
			await logoutApi();
		} catch {
			clearStoredTokens();
		}
		setCurrentUser(null);
		persistUser(null);
		setIsAuthLoading(false);
	};

	const value = useMemo(
		() => ({
			currentUser,
			isAuthLoading,
			login,
			signup,
			logout,
		}),
		[currentUser, isAuthLoading],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};

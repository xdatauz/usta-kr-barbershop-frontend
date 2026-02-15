import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	userType: "USER" | "ADMIN";
	image?: string | null;
}

interface AuthContextValue {
	currentUser: AuthUser | null;
	login: (payload: { email: string; password: string }) => void;
	signup: (payload: { name: string; email: string; password: string }) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "usta_auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

	useEffect(() => {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return;
		}
		try {
			const parsed = JSON.parse(raw) as AuthUser;
			setCurrentUser(parsed);
		} catch {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, []);

	const persistUser = (user: AuthUser | null) => {
		if (!user) {
			localStorage.removeItem(STORAGE_KEY);
			return;
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	};

	const login = ({ email }: { email: string; password: string }) => {
		const nameFromEmail = email.split("@")[0] || "Guest";
		const user: AuthUser = {
			id: crypto.randomUUID(),
			name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
			email,
			userType: "USER",
			image: null,
		};
		setCurrentUser(user);
		persistUser(user);
	};

	const signup = ({ name, email }: { name: string; email: string; password: string }) => {
		const user: AuthUser = {
			id: crypto.randomUUID(),
			name,
			email,
			userType: "USER",
			image: null,
		};
		setCurrentUser(user);
		persistUser(user);
	};

	const logout = () => {
		setCurrentUser(null);
		persistUser(null);
	};

	const value = useMemo(
		() => ({
			currentUser,
			login,
			signup,
			logout,
		}),
		[currentUser],
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


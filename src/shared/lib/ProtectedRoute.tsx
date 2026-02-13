
import { type ReactNode } from "react";

interface Props {
	children: ReactNode;
	allowedRoles: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
	return <>{children}</>;
};

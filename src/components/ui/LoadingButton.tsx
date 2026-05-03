import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "./Button";
import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

interface LoadingButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
	loadingText?: string;
}

export function LoadingButton({
	children,
	isLoading = false,
	loadingText,
	disabled,
	...props
}: LoadingButtonProps) {
	return (
		<Button
			disabled={isLoading || disabled}
			aria-busy={isLoading || undefined}
			{...props}
		>
			{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			{isLoading && loadingText ? loadingText : children}
		</Button>
	);
}

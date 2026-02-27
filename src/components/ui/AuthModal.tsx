import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth, type UserType } from "../../context/auth/auth-provider";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const { t } = useTranslation();
	const { login, signup, isAuthLoading } = useAuth();
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		userType: "USER" as UserType,
	});

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", onEscape);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	const submitHandler = async (event: FormEvent) => {
		event.preventDefault();
		if (!form.email.trim() || !form.password.trim()) {
			toast.warning(t("toast.validation.requiredFields"));
			return;
		}

		if (mode === "login") {
			const result = await login({ email: form.email.trim(), password: form.password.trim() });
			if (!result.ok) {
				toast.error(result.error || t("toast.auth.loginFailed"));
				return;
			}
			toast.success(t("toast.auth.loginSuccess"));
		} else {
			if (!form.name.trim()) {
				toast.warning(t("toast.validation.requiredFields"));
				return;
			}
			const result = await signup({
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password.trim(),
				userType: form.userType,
			});
			if (!result.ok) {
				toast.error(result.error || t("toast.auth.signupFailed"));
				return;
			}
			toast.success(t("toast.auth.signupSuccess"));
		}

		onClose();
	};

	const onOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			onClose();
		}
	};

	return createPortal(
		<div className="fixed inset-0 z-[9999] bg-black/60 p-4" onMouseDown={onOverlayClick}>
			<div className="flex h-full items-start justify-center overflow-y-auto py-6 sm:items-center">
				<div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{mode === "login" ? t("auth.loginTitle") : t("auth.signupTitle")}
						</h3>
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg p-1 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<form onSubmit={submitHandler} className="space-y-3">
						{mode === "signup" && (
							<>
								<input
									type="text"
									value={form.name}
									onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
									placeholder={t("auth.name")}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								/>
								<select
									value={form.userType}
									onChange={(event) => setForm((prev) => ({ ...prev, userType: event.target.value as UserType }))}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
								>
									<option value="USER">{t("auth.roles.user")}</option>
									<option value="BARBER">{t("auth.roles.barber")}</option>
									<option value="ADMIN">{t("auth.roles.admin")}</option>
								</select>
							</>
						)}

						<input
							type="email"
							value={form.email}
							onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
							placeholder={t("auth.email")}
							className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
						/>
						<input
							type="password"
							value={form.password}
							onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
							placeholder={t("auth.password")}
							className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
						/>

						<button
							type="submit"
							disabled={isAuthLoading}
							className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
						>
							{isAuthLoading ? t("common.loading") : mode === "login" ? t("auth.loginCta") : t("auth.signupCta")}
						</button>
					</form>

					<div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
						{mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
						<button
							type="button"
							onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
							className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
						>
							{mode === "login" ? t("auth.switchToSignup") : t("auth.switchToLogin")}
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}

import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { X, Phone, User, Lock, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth/auth-provider";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// Format digits into 010-XXXX-XXXX as user types
const formatKoreanPhone = (raw: string): string => {
	const digits = raw.replace(/\D/g, "").slice(0, 11);
	if (digits.length <= 3) return digits;
	if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

// Valid Korean mobile: 010-XXXX-XXXX
const isValidKoreanPhone = (phone: string): boolean => /^010-\d{4}-\d{4}$/.test(phone);

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const { t } = useTranslation();
	const { login, signup, isAuthLoading } = useAuth();
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [form, setForm] = useState({ name: "", phone: "", password: "", confirmPassword: "" });
	const [phoneError, setPhoneError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		if (!isOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onEsc);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onEsc);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm((prev) => ({ ...prev, [field]: e.target.value }));

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatKoreanPhone(e.target.value);
		setForm((prev) => ({ ...prev, phone: formatted }));
		if (phoneError) setPhoneError("");
	};

	const resetForm = () => {
		setForm({ name: "", phone: "", password: "", confirmPassword: "" });
		setPhoneError("");
		setShowPassword(false);
		setShowConfirmPassword(false);
	};

	const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!form.phone.trim() || !form.password.trim()) {
			toast.warning(t("toast.validation.requiredFields"));
			return;
		}

		if (!isValidKoreanPhone(form.phone)) {
			setPhoneError(t("auth.phoneInvalid"));
			return;
		}

		if (mode === "login") {
			const result = await login({ phone: form.phone.trim(), password: form.password });
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
			if (form.password !== form.confirmPassword) {
				toast.error(t("auth.passwordMismatch"));
				return;
			}
			const result = await signup({
				name: form.name.trim(),
				phone: form.phone.trim(),
				password: form.password,
			});
			if (!result.ok) {
				toast.error(result.error || t("toast.auth.signupFailed"));
				return;
			}
			toast.success(t("toast.auth.signupSuccess"));
		}

		onClose();
	};

	const onOverlay = (e: MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onClose();
	};

	const inputClass =
		"w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500";
	const inputErrorClass =
		"w-full rounded-xl border border-red-400 bg-white px-3 py-2.5 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none dark:border-red-500 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500";

	return createPortal(
		<div className="fixed inset-0 z-[9999] bg-black/60 p-4" onMouseDown={onOverlay}>
			<div className="flex h-full items-start justify-center overflow-y-auto py-6 sm:items-center">
				<div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
					{/* color bar */}
					<div className="h-1.5 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-emerald-500 dark:to-emerald-700" />

					<div className="p-5">
						{/* header */}
						<div className="mb-5 flex items-center justify-between">
							<div>
								<h3 className="text-base font-black text-slate-900 dark:text-slate-100">
									{mode === "login" ? t("auth.loginTitle") : t("auth.signupTitle")}
								</h3>
								<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
									{mode === "login" ? t("auth.loginHint") : t("auth.signupHint")}
								</p>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<form onSubmit={submitHandler} className="space-y-3">
							{mode === "signup" && (
								<div className="relative">
									<User className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
									<input
										type="text"
										value={form.name}
										onChange={set("name")}
										placeholder={t("auth.name")}
										className={inputClass}
									/>
								</div>
							)}

							<div>
								<div className="relative">
									<Phone className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
									<input
										type="tel"
										value={form.phone}
										onChange={handlePhoneChange}
										placeholder="010-4619-5515"
										maxLength={13}
										inputMode="numeric"
										className={phoneError ? inputErrorClass : inputClass}
									/>
								</div>
								{phoneError && <p className="mt-1 pl-1 text-xs text-red-500">{phoneError}</p>}
							</div>

							<div className="relative">
								<Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input
									type={showPassword ? "text" : "password"}
									value={form.password}
									onChange={set("password")}
									placeholder={t("auth.password")}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>

							{mode === "signup" && (
								<div className="relative">
									<Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
									<input
										type={showConfirmPassword ? "text" : "password"}
										value={form.confirmPassword}
										onChange={set("confirmPassword")}
										placeholder={t("auth.confirmPassword")}
										className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword((v) => !v)}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
									>
										{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
							)}

							<button
								type="submit"
								disabled={isAuthLoading}
								className="mt-1 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 active:scale-[.98] disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
							>
								{isAuthLoading ? t("common.loading") : mode === "login" ? t("auth.loginCta") : t("auth.signupCta")}
							</button>
						</form>

						<div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
							{mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
							<button
								type="button"
								onClick={() => {
									setMode((p) => (p === "login" ? "signup" : "login"));
									resetForm();
								}}
								className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
							>
								{mode === "login" ? t("auth.switchToSignup") : t("auth.switchToLogin")}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}

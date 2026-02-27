import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Clock3, Instagram, Mail, MapPinned, Phone, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { submitContactApi } from "../../lib/api/contact";
import { isApiError } from "../../lib/api/client";

interface ContactPageProps {
	preview?: boolean;
}

type SubmitStatus = "idle" | "sending" | "success" | "validationError" | "requestError" | "configError";

const ContactPage = ({ preview = false }: ContactPageProps) => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";
	const [status, setStatus] = useState<SubmitStatus>("idle");
	const [form, setForm] = useState({
		name: "",
		phone: "",
		message: "",
	});

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
			setStatus("validationError");
			return;
		}

		setStatus("sending");

		try {
			await submitContactApi({
				name: form.name.trim(),
				phone: form.phone.trim(),
				message: form.message.trim(),
			});
		} catch (error) {
			setStatus("requestError");
			toast.error(isApiError(error) && error.message ? error.message : t("toast.contact.submitFailed"));
			return;
		}

		setStatus("success");
		toast.success(t("toast.contact.submitSuccess"));
		setForm({
			name: "",
			phone: "",
			message: "",
		});
	};

	const sectionContent = (
		<section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6 lg:p-8 dark:border-slate-700 dark:bg-slate-900/70">
			<div className="max-w-2xl space-y-2">
				<p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:text-emerald-300">
					{t("contactSection.eyebrow")}
				</p>
				<h2 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-slate-50">
					{t("contactSection.title")}
				</h2>
				<p className="text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">
					{t("contactSection.description")}
				</p>
			</div>

			<div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
				<motion.form
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					onSubmit={onSubmit}
					className="space-y-4 rounded-2xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
				>
					<p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-6 text-emerald-700 dark:text-emerald-300">
						{t("contactSection.description")}
					</p>

					<div className="grid gap-3 sm:grid-cols-2">
						<label className="space-y-1">
							<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
								{t("contactSection.form.nameLabel")}
							</span>
							<input
								type="text"
								value={form.name}
								onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
								placeholder={t("contactSection.form.namePlaceholder")}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
							/>
						</label>
						<label className="space-y-1">
							<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
								{t("contactSection.form.phoneLabel")}
							</span>
							<input
								type="tel"
								value={form.phone}
								onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
								placeholder={t("contactSection.form.phonePlaceholder")}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
							/>
						</label>
					</div>

					<label className="space-y-1">
						<span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
							{t("contactSection.form.messageLabel")}
						</span>
						<textarea
							value={form.message}
							onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
							placeholder={t("contactSection.form.messagePlaceholder")}
							rows={preview ? 3 : 5}
							className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
						/>
					</label>

					<button
						type="submit"
						disabled={status === "sending"}
						className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
					>
						<Send className="h-4 w-4" />
						{status === "sending" ? t("contactSection.form.sending") : t("contactSection.form.submit")}
					</button>

					{status === "success" && (
						<p className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
							<CheckCircle2 className="h-4 w-4" />
							{t("contactSection.form.success")}
						</p>
					)}
					{status === "validationError" && (
						<p className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
							<AlertTriangle className="h-4 w-4" />
							{t("contactSection.form.error")}
						</p>
					)}
					{status === "requestError" && (
						<p className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
							<AlertTriangle className="h-4 w-4" />
							{t("contactSection.form.sendFail")}
						</p>
					)}
					{status === "configError" && (
						<p className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
							<AlertTriangle className="h-4 w-4" />
							{t("contactSection.form.configError")}
						</p>
					)}
				</motion.form>

				<div className="space-y-4">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						className="rounded-2xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
					>
						<div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
							<p className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
								<MapPinned className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
								{t("contactSection.info.addressLabel")}
							</p>
							<p>{t("contactSection.info.address")}</p>

							<p className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
								<Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
								{t("contactSection.info.phoneLabel")}
							</p>
							<a href="tel:+998901234567" className="block hover:text-emerald-600 dark:hover:text-emerald-300">
								+998 90 123 45 67
							</a>

							<p className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
								<Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
								{t("contactSection.info.emailLabel")}
							</p>
							<a href="mailto:hello@usta.barber" className="block hover:text-emerald-600 dark:hover:text-emerald-300">
								hello@usta.barber
							</a>

							<p className="inline-flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
								<Clock3 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
								{t("contactSection.info.hoursLabel")}
							</p>
							<p>{t("contactSection.info.weekdays")}</p>
							<p>{t("contactSection.info.weekend")}</p>

							<div className="pt-1">
								<p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
									{t("contactSection.info.socialLabel")}
								</p>
								<div className="flex items-center gap-3">
									<a
										href="https://www.instagram.com/usta_2019"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-slate-500 dark:border-slate-600 dark:hover:border-slate-400"
									>
										<Instagram className="h-3.5 w-3.5" />
										{t("social.instagram")}
									</a>
									<a
										href="https://t.me/usta_2019"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-slate-500 dark:border-slate-600 dark:hover:border-slate-400"
									>
										<Send className="h-3.5 w-3.5" />
										{t("social.telegram")}
									</a>
								</div>
							</div>
						</div>
					</motion.div>

					<div className="overflow-hidden rounded-2xl border border-slate-300/70 dark:border-slate-700">
						<iframe
							title={t("contactSection.info.mapLabel")}
							src="https://www.google.com/maps?q=41.2995,69.2401&z=14&output=embed"
							className="h-56 w-full border-0"
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					</div>
				</div>
			</div>

			{preview && (
				<div className="mt-5 flex justify-end">
					<Link
						to={`/${locale}/contact`}
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-slate-400"
					>
						{t("common.more")}
					</Link>
				</div>
			)}

			{!preview && (
				<div className="mt-8 grid gap-4 lg:grid-cols-2">
					<div className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{t("contactSection.extras.faqTitle")}
						</h3>
						<div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-300">
							<p>
								<strong>{t("contactSection.extras.faqOneQ")}</strong>
								<br />
								{t("contactSection.extras.faqOneA")}
							</p>
							<p>
								<strong>{t("contactSection.extras.faqTwoQ")}</strong>
								<br />
								{t("contactSection.extras.faqTwoA")}
							</p>
						</div>
					</div>
					<div className="rounded-2xl border border-slate-300/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
						<h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
							{t("contactSection.extras.tipsTitle")}
						</h3>
						<ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
							<li>{t("contactSection.extras.tipOne")}</li>
							<li>{t("contactSection.extras.tipTwo")}</li>
							<li>{t("contactSection.extras.tipThree")}</li>
						</ul>
					</div>
				</div>
			)}
		</section>
	);

	if (preview) {
		return sectionContent;
	}

	return (
		<main className="w-full px-3 pb-14 pt-24 sm:px-5 lg:px-8">
			<div className="mx-auto max-w-6xl">{sectionContent}</div>
		</main>
	);
};

export default ContactPage;

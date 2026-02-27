import { useTranslation } from "react-i18next";
import { Instagram, Send, Phone, MapPin, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const locale = location.pathname.split("/")[1] || "uz";

	return (
		<footer className="w-full px-4 py-8 sm:px-8">
			<div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-3">
				<div className="space-y-3">
					<Link
						to={`/${locale}`}
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						className="inline-block text-lg font-black tracking-[0.12em]"
					>
						{t("brand.primary")} <span className="text-emerald-400">{t("brand.secondary")}</span>
					</Link>
					<p className="max-w-xs text-sm text-slate-400">{t("footer.tagline")}</p>
					<div className="flex gap-2">
						<a
							href="https://www.instagram.com/usta_2019"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-lg border border-slate-700 p-2 hover:border-emerald-400 hover:text-emerald-300"
						>
							<Instagram className="h-4 w-4" />
						</a>
						<a
							href="https://t.me/usta_2019"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-lg border border-slate-700 p-2 hover:border-emerald-400 hover:text-emerald-300"
						>
							<Send className="h-4 w-4" />
						</a>
						<a
							href="https://www.usta.best"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-lg border border-slate-700 p-2 hover:border-emerald-400 hover:text-emerald-300"
						>
							<ExternalLink className="w-5 h-5" />
						</a>
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{t("footer.quickLinks")}</p>
					<div className="grid grid-cols-2 gap-2 text-sm">
						<Link to={`/${locale}`} className="hover:text-emerald-300">
							{t("nav.home")}
						</Link>
						<Link to={`/${locale}/services`} className="hover:text-emerald-300">
							{t("nav.services")}
						</Link>
						<Link to={`/${locale}/barbers`} className="hover:text-emerald-300">
							{t("nav.barbers")}
						</Link>
						<Link to={`/${locale}/gallery`} className="hover:text-emerald-300">
							{t("nav.gallery")}
						</Link>
						<Link to={`/${locale}/about`} className="hover:text-emerald-300">
							{t("nav.about")}
						</Link>
						<Link to={`/${locale}/contact`} className="hover:text-emerald-300">
							{t("nav.contact")}
						</Link>
						<Link to={`/${locale}/booking`} className="hover:text-emerald-300">
							{t("nav.booking")}
						</Link>
					</div>
				</div>

				<div className="space-y-2 text-sm">
					<p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{t("footer.contactTitle")}</p>
					<p className="inline-flex items-center gap-2 ">
						<MapPin className="h-4 w-4 text-emerald-400" />
						{t("contactSection.info.address")}
					</p>
					<a href="tel:+998901234567" className="inline-flex items-center gap-2 hover:text-emerald-300">
						<Phone className="h-4 w-4 text-emerald-400" />
						+998 90 123 45 67
					</a>
				</div>
			</div>

			<div className="mx-auto mt-6 w-full max-w-6xl border-t border-slate-800 pt-4 text-xs ">{t("footer.text")}</div>
		</footer>
	);
};

export default Footer;

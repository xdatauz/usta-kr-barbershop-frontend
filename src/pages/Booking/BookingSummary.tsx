import { Scissors } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Service } from "../../lib/api/services";

interface BookingSummaryProps {
	name: string;
	phone: string;
	barberName: string;
	serviceName: string;
	date: string;
	time: string;
	services: Service[];
}

const BookingSummary = ({
	name,
	phone,
	barberName,
	serviceName,
	date,
	time,
	services,
}: BookingSummaryProps) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
				<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t("bookingPage.summary.title")}</h2>
				<div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
					<p>
						<strong>{t("bookingPage.form.labels.name")}:</strong> {name || "-"}
					</p>
					<p>
						<strong>{t("bookingPage.form.labels.phone")}:</strong> {phone || "-"}
					</p>
					<p>
						<strong>{t("bookingPage.form.labels.barber")}:</strong> {barberName}
					</p>
					<p>
						<strong>{t("bookingPage.form.labels.service")}:</strong> {serviceName}
					</p>
					<p>
						<strong>{t("bookingPage.form.labels.date")}:</strong> {date || "-"}
					</p>
					<p>
						<strong>{t("bookingPage.form.labels.time")}:</strong> {time || "-"}
					</p>
				</div>
			</div>

			{services.length > 0 && (
				<div className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
					<h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
						<Scissors className="inline h-5 w-5 text-emerald-600 dark:text-emerald-300 mr-2" />
						{t("servicesSection.title")}
					</h2>
					<div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
						{services.map((service) => (
							<div key={service.id} className="flex items-center justify-between py-2 text-sm">
								<span className="font-medium text-slate-800 dark:text-slate-200">{service.name}</span>
								<span className="text-emerald-700 dark:text-emerald-300 font-semibold">
									₩{Math.round(Number(service.price)).toLocaleString("ko-KR")}
									{service.durationMinutes ? (
										<span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
											{service.durationMinutes} {t("common.min")}
										</span>
									) : null}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default BookingSummary;

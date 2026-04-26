import { useMemo } from "react";
import { CalendarClock, Check, Scissors, ScrollText, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

export type BookingStepKey = "barber" | "service" | "datetime" | "summary";

interface BookingStepperProps {
	currentStep: BookingStepKey;
	completed: Record<BookingStepKey, boolean>;
	onJumpToStep?: (step: BookingStepKey) => void;
}

const STEP_ORDER: BookingStepKey[] = ["barber", "service", "datetime", "summary"];

const STEP_ICONS: Record<BookingStepKey, typeof UserRound> = {
	barber: UserRound,
	service: Scissors,
	datetime: CalendarClock,
	summary: ScrollText,
};

const BookingStepper = ({ currentStep, completed, onJumpToStep }: BookingStepperProps) => {
	const { t } = useTranslation();

	const currentIndex = useMemo(() => STEP_ORDER.indexOf(currentStep), [currentStep]);

	return (
		<nav
			aria-label={t("bookingPage.stepper.ariaLabel")}
			className="rounded-3xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5"
		>
			<ol className="flex flex-wrap items-center gap-2 sm:gap-3">
				{STEP_ORDER.map((step, index) => {
					const Icon = STEP_ICONS[step];
					const isCurrent = step === currentStep;
					const isCompleted = completed[step];
					const isReachable = index <= currentIndex || isCompleted;
					const clickable = !!onJumpToStep && isReachable && !isCurrent;

					const baseClasses =
						"inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition sm:text-sm";
					const stateClasses = isCurrent
						? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/60 dark:text-emerald-200"
						: isCompleted
							? "border-emerald-400/60 bg-emerald-500/5 text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300"
							: "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400";
					const interactivity = clickable
						? "cursor-pointer hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200"
						: "cursor-default";

					return (
						<li key={step} className="flex flex-1 items-center gap-2 sm:flex-none">
							<button
								type="button"
								onClick={() => (clickable ? onJumpToStep?.(step) : undefined)}
								disabled={!clickable}
								aria-current={isCurrent ? "step" : undefined}
								className={`${baseClasses} ${stateClasses} ${interactivity} w-full justify-center sm:w-auto`}
							>
								<span
									className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
										isCompleted
											? "bg-emerald-500 text-white"
											: isCurrent
												? "bg-emerald-500 text-white"
												: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
									}`}
								>
									{isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
								</span>
								<Icon className="hidden h-4 w-4 sm:block" aria-hidden />
								<span className="truncate">{t(`bookingPage.stepper.steps.${step}`)}</span>
							</button>
							{index < STEP_ORDER.length - 1 && (
								<span
									aria-hidden
									className={`hidden h-px flex-1 sm:block ${
										index < currentIndex || completed[STEP_ORDER[index + 1]]
											? "bg-emerald-400/60"
											: "bg-slate-300 dark:bg-slate-700"
									}`}
								/>
							)}
						</li>
					);
				})}
			</ol>
			<p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
				{t("bookingPage.stepper.progress", {
					current: currentIndex + 1,
					total: STEP_ORDER.length,
				})}
			</p>
		</nav>
	);
};

export default BookingStepper;

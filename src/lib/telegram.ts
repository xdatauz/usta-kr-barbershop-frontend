export type TelegramSendResult =
	| { ok: true }
	| { ok: false; reason: "missing_config" | "request_failed" };

const getTelegramConfig = () => {
	const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN?.trim();
	const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID?.trim();

	if (!token || !chatId) {
		return null;
	}

	return { token, chatId };
};

export const sendTelegramMessage = async (lines: string[]): Promise<TelegramSendResult> => {
	const config = getTelegramConfig();

	if (!config) {
		return { ok: false, reason: "missing_config" };
	}

	try {
		const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				chat_id: config.chatId,
				text: lines.join("\n"),
				disable_web_page_preview: true,
			}),
		});

		if (!response.ok) {
			return { ok: false, reason: "request_failed" };
		}

		const payload = (await response.json()) as { ok?: boolean };
		if (!payload.ok) {
			return { ok: false, reason: "request_failed" };
		}

		return { ok: true };
	} catch {
		return { ok: false, reason: "request_failed" };
	}
};

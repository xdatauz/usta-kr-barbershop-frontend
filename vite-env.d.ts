/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_TELEGRAM_BOT_TOKEN?: string;
	readonly VITE_TELEGRAM_CHAT_ID?: string;
	readonly VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID?: string;
	readonly VITE_INSTAGRAM_ACCESS_TOKEN?: string;
	// add other env variables here as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

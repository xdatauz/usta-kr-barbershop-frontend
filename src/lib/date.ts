/** Mahalliy sanani YYYY-MM-DD formatda qaytaradi (UTC emas!) */
export function localDateStr(date: Date = new Date()): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** Ertangi mahalliy sanani YYYY-MM-DD formatda qaytaradi */
export function tomorrowDateStr(): string {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return localDateStr(d);
}

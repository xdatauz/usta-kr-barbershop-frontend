// Shared utilities for normalizing API responses

export function normalizeId(raw: unknown): string | null {
	if (typeof raw === 'string' && raw.length > 0) return raw;
	if (typeof raw === 'number') return String(raw);
	return null;
}

export function normalizeString(raw: unknown, fallback = ''): string {
	return typeof raw === 'string' ? raw : fallback;
}

export function normalizeNumber(raw: unknown, fallback = 0): number {
	const n = Number(raw);
	return Number.isFinite(n) ? n : fallback;
}

export function normalizeBoolean(raw: unknown, fallback = false): boolean {
	if (typeof raw === 'boolean') return raw;
	return fallback;
}

export function normalizeArray<T>(raw: unknown, mapper: (item: unknown) => T | null): T[] {
	if (!Array.isArray(raw)) return [];
	return raw.map(mapper).filter((x): x is T => x !== null);
}

/**
 * Extract a list from various backend response shapes:
 *   - plain array
 *   - { items: [...] }
 *   - { data: [...] }
 *   - { data: { items: [...] } }
 */
export function extractList(response: unknown): unknown[] {
	if (Array.isArray(response)) return response;
	if (!response || typeof response !== 'object') return [];
	const src = response as Record<string, unknown>;
	if (Array.isArray(src.items)) return src.items;
	if (Array.isArray(src.data)) return src.data;
	if (src.data && typeof src.data === 'object') {
		const data = src.data as Record<string, unknown>;
		if (Array.isArray(data.items)) return data.items;
	}
	return [];
}

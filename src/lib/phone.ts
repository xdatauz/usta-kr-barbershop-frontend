/**
 * Normalise a Korean phone number to international form `+82 10-1234-5678`.
 *
 * Accepts:
 *   - "010-1234-5678" / "01012345678" / "010 1234 5678"
 *   - "+82 10-1234-5678" (already international — returned as-is, normalised)
 *
 * Returns the canonical `+82 <local-without-leading-0>` string, preserving
 * the local part's dash grouping (3-4-4 or 3-3-4 depending on prefix length).
 * If the input doesn't match a Korean mobile pattern, the trimmed input is
 * returned unchanged (server-side validation will catch malformed values).
 */
export function toInternationalKoreanPhone(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;

	const digits = trimmed.replace(/\D/g, "");
	let local: string;
	if (digits.startsWith("82")) {
		local = digits.slice(2);
	} else if (digits.startsWith("0")) {
		local = digits.slice(1);
	} else {
		return trimmed;
	}

	if (!/^1[016789]\d{7,8}$/.test(local)) return trimmed;

	const prefix = local.slice(0, 2);
	const rest = local.slice(2);
	const middleLen = rest.length === 8 ? 4 : 3;
	const middle = rest.slice(0, middleLen);
	const last = rest.slice(middleLen);
	return `+82 ${prefix}-${middle}-${last}`;
}

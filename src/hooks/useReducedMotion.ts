import { useEffect, useState } from "react";

/**
 * Returns `true` when the user has requested reduced motion at the OS level.
 * Use this to gate decorative framer-motion variants and CSS keyframes.
 */
export function useReducedMotion(): boolean {
	const [prefers, setPrefers] = useState(() => {
		if (typeof window === "undefined" || !window.matchMedia) return false;
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return prefers;
}

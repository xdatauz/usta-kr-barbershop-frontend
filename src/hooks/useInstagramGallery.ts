import { useState, useEffect } from "react";
import { convertInstagramToGallery, fetchInstagramMedia, type InstagramMedia } from "../lib/api/instagram";

interface UseInstagramGalleryReturn {
	instagramMedia: ReturnType<typeof convertInstagramToGallery>;
	loading: boolean;
	error: Error | null;
	refresh: () => Promise<void>;
}

// Simple in-memory cache with TTL (5 minutes)
let cachedMedia: ReturnType<typeof convertInstagramToGallery> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch and manage Instagram gallery media
 * Features:
 * - Automatic caching to reduce API calls
 * - Error handling with fallback
 * - Manual refresh capability
 * - Loading state management
 */
export const useInstagramGallery = (limit: number = 12): UseInstagramGalleryReturn => {
	const [media, setMedia] = useState<ReturnType<typeof convertInstagramToGallery>>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchAndSetMedia = async () => {
		try {
			setLoading(true);
			setError(null);

			// Check cache validity
			const now = Date.now();
			if (cachedMedia !== null && now - cacheTimestamp < CACHE_TTL) {
				setMedia(cachedMedia);
				setLoading(false);
				return;
			}

			// Fetch fresh data
			const instagramData = await fetchInstagramMedia(limit);
			const convertedData = convertInstagramToGallery(instagramData);

			// Update cache
			cachedMedia = convertedData;
			cacheTimestamp = now;

			setMedia(convertedData);
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Failed to fetch Instagram media");
			setError(error);
			console.error("Instagram fetch error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAndSetMedia();
	}, [limit]);

	return {
		instagramMedia: media,
		loading,
		error,
		refresh: fetchAndSetMedia,
	};
};

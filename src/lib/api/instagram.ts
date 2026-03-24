/**
 * Instagram API Integration
 * Fetches images and reels from Instagram using Instagram Graph API
 *
 * Setup Instructions:
 * 1. Set VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID in .env
 * 2. Set VITE_INSTAGRAM_ACCESS_TOKEN in .env
 *
 * To get these:
 * - Visit: https://developers.facebook.com/docs/instagram-graph-api/get-started
 * - Create a Facebook App with Instagram Basic Display permissions
 * - Generate a long-lived access token
 */

export interface InstagramImage {
	id: string;
	caption: string;
	media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
	media_url: string;
	permalink: string;
	timestamp: string;
	thumbnail_url?: string; // For VIDEO type
}

export interface InstagramMedia {
	data: InstagramImage[];
	paging?: {
		cursors: {
			before: string;
			after: string;
		};
		next?: string;
		previous?: string;
	};
}

const INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com/v18.0";

/**
 * Fetches Instagram media (images and reels) from a business account
 * @param limit - Number of items to fetch (max 50)
 * @returns Promise<InstagramImage[]>
 */
export const fetchInstagramMedia = async (limit: number = 12): Promise<InstagramImage[]> => {
	try {
		const businessAccountId = import.meta.env.VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID as string;
		const accessToken = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN as string;

		if (!businessAccountId || !accessToken) {
			console.warn(
				"Instagram API credentials not configured. Add VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID and VITE_INSTAGRAM_ACCESS_TOKEN to .env",
			);
			return [];
		}

		const fields = "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url";
		const url = `${INSTAGRAM_GRAPH_API_BASE}/${businessAccountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Instagram API error: ${response.status} ${response.statusText}`);
			return [];
		}

		const data: InstagramMedia = await response.json();
		return data.data || [];
	} catch (error) {
		console.error("Failed to fetch Instagram media:", error);
		return [];
	}
};

/**
 * Converts Instagram media to gallery image format
 */
export const convertInstagramToGallery = (instagramMedia: InstagramImage[]) => {
	return instagramMedia.map((media) => ({
		src: media.media_type === "VIDEO" ? media.thumbnail_url || media.media_url : media.media_url,
		category: "instagram" as const,
		caption: media.caption,
		permalink: media.permalink,
		mediaType: media.media_type,
		timestamp: media.timestamp,
		isInstagram: true,
	}));
};

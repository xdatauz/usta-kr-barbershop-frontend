import { BARBER_MEDIA, type BarberId } from "../../lib/barbers";
import type { BarberProfile, BarberStats } from "../../lib/api/barbers";

export const EMPTY_STATS: BarberStats = {
	likes: 0,
	dislikes: 0,
	followers: 0,
	reports: 0,
};

export const toBarberId = (value: string): BarberId | null => {
	const id = BARBER_MEDIA.find((barber) => barber.id === value);
	return id ? id.id : null;
};

export const withUiFallback = (barber: BarberProfile, t: (key: string) => string): BarberProfile => {
	const safeId = toBarberId(barber.id);
	const fallbackImage = safeId ? BARBER_MEDIA.find((item) => item.id === safeId)?.image || "" : "";

	return {
		...barber,
		name: barber.name || (safeId ? t(`barbersPage.barbers.${safeId}.name`) : barber.id),
		role: barber.role || (safeId ? t(`barbersPage.barbers.${safeId}.role`) : ""),
		bio: barber.bio || (safeId ? t(`barbersPage.barbers.${safeId}.bio`) : ""),
		image: barber.image || fallbackImage,
		stats: {
			...EMPTY_STATS,
			...barber.stats,
		},
		viewer: {
			isFollowing: Boolean(barber.viewer?.isFollowing),
			liked: Boolean(barber.viewer?.liked),
			disliked: Boolean(barber.viewer?.disliked),
		},
	};
};

export const buildFallbackBarbers = (t: (key: string) => string): BarberProfile[] => {
	return BARBER_MEDIA.map((barber) => ({
		id: barber.id,
		name: t(`barbersPage.barbers.${barber.id}.name`),
		role: t(`barbersPage.barbers.${barber.id}.role`),
		bio: t(`barbersPage.barbers.${barber.id}.bio`),
		image: barber.image,
		stats: EMPTY_STATS,
		viewer: { isFollowing: false, liked: false, disliked: false },
	}));
};

export interface BarberRating {
	stars: number;
	totalReviews: number;
	isNew: boolean;
}

/** Compute 1-5 star rating from likes/dislikes ratio, rounded to nearest 0.5. */
export const computeBarberRating = (stats: BarberStats): BarberRating => {
	const total = (stats.likes || 0) + (stats.dislikes || 0);
	if (total === 0) {
		return { stars: 0, totalReviews: 0, isNew: true };
	}
	const ratio = (stats.likes || 0) / total;
	// Minimum 1 star when there are any reviews, max 5 stars.
	const raw = 1 + ratio * 4;
	const stars = Math.round(raw * 2) / 2;
	return { stars, totalReviews: total, isNew: false };
};

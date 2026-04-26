import { useCallback, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/auth/auth-provider";
import {
	dislikeBarberApi,
	followBarberApi,
	getBarberCommentsApi,
	likeBarberApi,
	postBarberCommentApi,
	reportBarberApi,
	unfollowBarberApi,
	type BarberComment,
	type BarberStats,
	type BarberViewer,
} from "../../../lib/api/barbers";
import { isApiError } from "../../../lib/api/client";

export type StatsPatch = Partial<BarberStats>;
export type ViewerPatch = Partial<BarberViewer>;

export interface UseBarberActionsOptions {
	onStatsChange?: (id: string, stats: StatsPatch, viewer?: ViewerPatch) => void;
	onCommentsChange?: (updater: (prev: BarberComment[]) => BarberComment[]) => void;
}

export const useBarberActions = ({ onStatsChange, onCommentsChange }: UseBarberActionsOptions = {}) => {
	const { t } = useTranslation();
	const { currentUser } = useAuth();
	const [isActionLoading, setIsActionLoading] = useState(false);

	const requireAuth = useCallback(() => {
		if (!currentUser) {
			toast.warning(t("toast.auth.required"));
			return false;
		}
		return true;
	}, [currentUser, t]);

	const likeBarber = useCallback(
		async (id: string) => {
			if (!requireAuth()) return;
			setIsActionLoading(true);
			try {
				const result = await likeBarberApi(id);
				if (result) {
					onStatsChange?.(id, result.stats, { liked: result.liked, disliked: result.disliked });
				}
				toast.success(t("toast.barbers.likeSuccess"));
			} catch (error) {
				const message = isApiError(error) && error.message ? error.message : t("toast.barbers.likeFailed");
				toast.error(message);
			} finally {
				setIsActionLoading(false);
			}
		},
		[requireAuth, t, onStatsChange],
	);

	const dislikeBarber = useCallback(
		async (id: string) => {
			if (!requireAuth()) return;
			setIsActionLoading(true);
			try {
				const result = await dislikeBarberApi(id);
				if (result) {
					onStatsChange?.(id, result.stats, { liked: result.liked, disliked: result.disliked });
				}
				toast.success(t("toast.barbers.dislikeSuccess"));
			} catch (error) {
				const message = isApiError(error) && error.message ? error.message : t("toast.barbers.dislikeFailed");
				toast.error(message);
			} finally {
				setIsActionLoading(false);
			}
		},
		[requireAuth, t, onStatsChange],
	);

	const toggleFollow = useCallback(
		async (id: string, currentFollowingState: boolean) => {
			if (!requireAuth()) return;
			setIsActionLoading(true);
			try {
				const response = currentFollowingState ? await unfollowBarberApi(id) : await followBarberApi(id);
				const newIsFollowing = !currentFollowingState;
				onStatsChange?.(id, { followers: response.followers }, { isFollowing: newIsFollowing });
				toast.success(newIsFollowing ? t("toast.barbers.followSuccess") : t("toast.barbers.unfollowSuccess"));
			} catch (error) {
				const message = isApiError(error) && error.message ? error.message : t("toast.barbers.followFailed");
				toast.error(message);
			} finally {
				setIsActionLoading(false);
			}
		},
		[requireAuth, t, onStatsChange],
	);

	const submitComment = useCallback(
		async (event: FormEvent<HTMLFormElement>, id: string, commentText: string, clearText: () => void) => {
			event.preventDefault();
			if (!requireAuth()) return;

			if (!commentText.trim()) {
				toast.warning(t("toast.validation.commentRequired"));
				return;
			}

			setIsActionLoading(true);
			try {
				const created = await postBarberCommentApi(id, { text: commentText.trim() });
				if (created) {
					onCommentsChange?.((prev) => [created, ...prev]);
				} else {
					const latest = await getBarberCommentsApi(id);
					onCommentsChange?.(() => latest.items);
				}
				clearText();
				toast.success(t("toast.barbers.commentSuccess"));
			} catch (error) {
				const message = isApiError(error) && error.message ? error.message : t("toast.barbers.commentFailed");
				toast.error(message);
			} finally {
				setIsActionLoading(false);
			}
		},
		[requireAuth, t, onCommentsChange],
	);

	const submitReport = useCallback(
		async (
			id: string,
			reportReason: string,
			reportDetails: string,
			onSuccess: () => void,
			onError: () => void,
		) => {
			if (!requireAuth()) return;

			if (!reportReason) {
				onError();
				toast.warning(t("toast.validation.reportReasonRequired"));
				return;
			}

			setIsActionLoading(true);
			try {
				await reportBarberApi(id, {
					reason: reportReason,
					details: reportDetails.trim() || undefined,
				});
				onSuccess();
				toast.success(t("toast.barbers.reportSuccess"));
			} catch (error) {
				onError();
				const message = isApiError(error) && error.message ? error.message : t("toast.barbers.reportFailed");
				toast.error(message);
			} finally {
				setIsActionLoading(false);
			}
		},
		[requireAuth, t],
	);

	return {
		isActionLoading,
		likeBarber,
		dislikeBarber,
		toggleFollow,
		submitComment,
		submitReport,
	};
};

export default useBarberActions;

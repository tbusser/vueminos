import { useGlobalI18n } from '@/i18n';

import { useGameStore } from '@/stores/game';
import { useRoundsStore } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';

/* ========================================================================== */

export function useGameLogic() {
	const { t } = useGlobalI18n();
	const gameStore = useGameStore();

	/* ---------------------------------------------------------------------- */

	/**
	 * Validates the points limit for a new game.
	 *
	 * @param limit The specified points limit for the game.
	 *
	 * @returns True if the limit is valid, false otherwise.
	 */
	function isValidLimit(limit: unknown): limit is number {
		if (typeof limit !== 'number') return false;
		if (isNaN(limit)) return false;
		if (limit <= 0) return false;

		return true;
	}

	/**
	 * Removes all data pertaining to the current game from the stores.
	 */
	function clearGameData(): void {
		useTurnsStore().$reset();
		useRoundsStore().$reset();
		gameStore.$reset();
	}

	/**
	 * Starts a new game with the specified points limit.
	 *
	 * @param limit The number of points which, when reached by a player, means
	 *        the game will come to an end after the current round.
	 */
	function startNewGame(limit: number): Feedback {
		if (!isValidLimit(limit)) {
			return { success: false, message: t('errorMessages.invalidLimit') };
		}

		gameStore.createNewGame(limit);

		return { success: true };
	}

	/* ---------------------------------------------------------------------- */

	return {
		isValidLimit,
		clearGameData,
		startNewGame
	};
}

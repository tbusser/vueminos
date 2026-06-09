import { useGlobalI18n } from '@/i18n';

import { useGameStore } from '@/stores/game';
import { useRoundsStore } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';

import type { Feedback } from '@/types/Feedback';

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
		if (!Number.isFinite(limit)) return false;
		if (limit <= 0) return false;

		return true;
	}

	/**
	 * Resets the game progress by clearing the turns, rounds, and game data.
	 * The players store is intentionally preserved so users can start a new
	 * game with the same group without re-entering names.
	 */
	function resetGameProgress(): void {
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
			return { success: false, message: t('gameLimit.errorInvalidLimit') };
		}

		gameStore.createNewGame(limit);

		return { success: true };
	}

	/* ---------------------------------------------------------------------- */

	return {
		isValidLimit,
		resetGameProgress,
		startNewGame
	};
}

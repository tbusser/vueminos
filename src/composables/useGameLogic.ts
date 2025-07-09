import { useGameStore } from '@/stores/game';

/* ========================================================================== */

export function useGameLogic() {
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
	 * Starts a new game with the specified points limit.
	 *
	 * @param limit The number of points which, when reached by a player, means
	 *        the game will come to an end after the current round.
	 *
	 * @returns The unique identifier of the newly created game, or undefined
	 *          if the limit is invalid.
	 */
	function startNewGame(limit: number): void {
		if (!isValidLimit(limit)) return;

		gameStore.createNewGame(limit);
	}

	/* ---------------------------------------------------------------------- */

	return {
		isValidLimit,
		startNewGame
	};
}

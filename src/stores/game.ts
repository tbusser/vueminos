import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

/* ========================================================================== */

export const useGameStore = defineStore('game', () => {
	/**
	 * The limit of points a player needs to win the game.
	 */
	const pointsLimit = ref<number>(0);

	/**
	 * The timestamp when the game started. When there is no game, the value
	 * is undefined.
	 */
	const startTimestamp = ref<number | undefined>(undefined);

	/* ---------------------------------------------------------------------- */

	const hasActiveGame = computed<boolean>(() => startTimestamp.value !== undefined);

	/* ---------------------------------------------------------------------- */

	/**
	 * Resets the game store by clearing the game ID, points limit, and start
	 * timestamp.
	 */
	function $reset(): void {
		pointsLimit.value = 0;
		startTimestamp.value = undefined;
	}

	/**
	 * Creates a new game with the given points limit.
	 *
	 * @param limit The number of points which, when reached by a player,
	 *        needed to mark the current round as the final round of the game.
	 *
	 * @returns The unique identifier of the newly created game.
	 */
	function createNewGame(limit: number): void {
		pointsLimit.value = limit;
		startTimestamp.value = Date.now();
	}

	/* ---------------------------------------------------------------------- */

	return {
		// State
		pointsLimit,
		startTimestamp,

		// Getters
		hasActiveGame,

		// Actions
		$reset,
		createNewGame
	};
}, {
	persist: {
		storage: localStorage
	}
});

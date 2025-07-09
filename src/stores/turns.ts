import { ref } from 'vue';
import { defineStore } from 'pinia';

import { TurnIdNotFoundError } from '@/errors';

/* ========================================================================== */

export const useTurnsStore = defineStore('turns', () => {
	/**
	 * A list of turns.
	 */
	const turns = ref<Turn[]>([]);

	/* ---------------------------------------------------------------------- */

	/**
	 * Resets the turns store to its initial state.
	 */
	function $reset(): void {
		turns.value = [];
	}

	/**
	 * Adds a new turn to the list of turns.
	 *
	 * @param turn The turn to add to the list of turns.
	 */
	function addTurn(turn: Turn): void {
		turns.value.push(turn);
	}

	/**
	 * Deletes all turns associated with a specific round ID.
	 *
	 * @param roundId The ID of the round for which to delete turns.
	 */
	function deleteTurnsForRound(roundId: Id): void {
		turns.value = turns.value.filter(turn => turn.roundId !== roundId);
	}

	/**
	 * Updates a turn in the list of turns.
	 *
	 * @param id The ID of the turn to update.
	 * @param update The partial update to apply to the turn.
	 */
	function updateTurn(id: Id, update: Partial<Omit<Turn, 'gameId' | 'id' | 'roundId'>>): void {
		const index = turns.value.findIndex(turn => turn.id === id);

		if (index === -1) {
			throw new TurnIdNotFoundError(`Unable to update turn, turn with ID ${id} not found`);
		}

		turns.value[index] = { ...turns.value[index], ...update };
	}

	/* ---------------------------------------------------------------------- */

	return {
		// State
		turns,

		// Actions
		$reset,
		addTurn,
		deleteTurnsForRound,
		updateTurn
	};
});

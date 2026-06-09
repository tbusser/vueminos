import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { PlayerIdNotFoundError } from '@/errors';

/* ========================================================================== */

export type Player = {
	/**
	 * Indicates whether the player is currently active in the game.
	 * Inactive players should not be given a turn in the current round.
	 *
	 * @example true
	 */
	active: boolean;

	/**
	 * A unique identifier for the player.
	 *
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	id: Id;

	/**
	 * The name of the player.
	 *
	 * @example 'Alice'
	 */
	name: string;
};

type UpdatableFields = Pick<Player, 'active' | 'name'>;

/* ========================================================================== */

export const usePlayersStore = defineStore('players', () => {
	/**
	 * A list of players.
	 */
	const players = ref<Player[]>([]);

	/* ---------------------------------------------------------------------- */

	/**
	 * A computed property that returns the list of active players.
	 */
	const activePlayers = computed<Player[]>(() => players.value.filter(player => player.active));

	/**
	 * Retrieves a player by their ID.
	 *
	 * @param id The ID of the player to retrieve.
	 *
	 * @returns A copy of the player with the specified ID, or undefined if
	 *          not found.
	 */
	function getPlayerById(id: Id): Player | undefined {
		const player = players.value.find(existingPlayer => existingPlayer.id === id);

		return player === undefined ? undefined : { ...player };
	}

	/**
	 * A computed property that checks if there are any active players.
	 *
	 * @returns True if there are active players, false otherwise.
	 */
	const hasActivePlayers = computed(() => activePlayers.value.length > 0);

	/* ---------------------------------------------------------------------- */

	/**
	 * Retrieves the index of a player by their ID.
	 *
	 * @param id The ID of the player to find.
	 *
	 * @returns The index of the player in the players array.
	 *
	 * @throws {PlayerIdNotFoundError} If the player with the specified ID is
	 *         not found, an error is thrown.
	 */
	function getPlayerIndexById(id: Id): number {
		const index = players.value.findIndex(player => player.id === id);
		if (index === -1) {
			throw new PlayerIdNotFoundError(`Player with ID ${id} not found in players store.`);
		}

		return index;
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Resets the players store by clearing all players.
	 */
	function $reset(): void {
		players.value = [];
	}

	/**
	 * Adds a new player with the specified name to the list of players.
	 *
	 * @param player The player to add to the list.
	 */
	function addPlayer(player: Player): void {
		players.value.push({ ...player });
	}

	/**
	 * Removes a player by their ID from the list of players. In case of an
	 * unknown player ID, no action is taken.
	 *
	 * @param id The ID of the player to remove.
	 */
	function removePlayerById(id: Id): void {
		players.value = players.value.filter(player => player.id !== id);
	}

	/**
	 * Updates a player's field by their ID.
	 *
	 * @param id The ID of the player to update.
	 * @param field The field of the player to update.
	 * @param value The new value to set for the specified field.
	 *
 	 * @throws {PlayerIdNotFoundError} If the player with the specified ID is
	 *         not found in the players store.
	 */
	function updatePlayerById<K extends keyof UpdatableFields>(id: Id, field: K, value: UpdatableFields[K]): void {
		const index = getPlayerIndexById(id);

		players.value[index] = {
			...players.value[index],
			[field]: value
		};
	}

	/* ---------------------------------------------------------------------- */

	return {
		// State
		players,

		// Getters
		activePlayers,
		getPlayerById,
		hasActivePlayers,

		// Actions
		$reset,
		addPlayer,
		removePlayerById,
		updatePlayerById
	};
}, {
	persist: {
		storage: localStorage
	}
});

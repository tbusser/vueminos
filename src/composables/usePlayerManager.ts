import { computed, readonly } from 'vue';
import { storeToRefs } from 'pinia';

import { useGlobalI18n } from '@/i18n';

import { usePlayersStore } from '@/stores/players';

import type { Feedback } from '@/types/Feedback';

import { generateId } from '@/utilities/id';
import { isNilOrEmptyString } from '@/utilities/string';

import { useRules } from './useRules';

/* ========================================================================== */

export function usePlayerManager() {
	const playerStore = usePlayersStore();
	const { t } = useGlobalI18n();

	/* ---------------------------------------------------------------------- */

	const { activePlayers, players } = storeToRefs(playerStore);
	const { maximumNumberOfPlayers, minimumNumberOfPlayers } = useRules();

	/* ---------------------------------------------------------------------- */

	const hasPlayers = computed<boolean>(() => players.value.length > 0);
	const hasValidNumberOfActivePlayers = computed<boolean>(() =>
		activePlayers.value.length >= minimumNumberOfPlayers && activePlayers.value.length <= maximumNumberOfPlayers
	);
	const hasExceededMaximum = computed<boolean>(() => players.value.length > maximumNumberOfPlayers);
	const hasReachedMaximum = computed<boolean>(() => players.value.length >= maximumNumberOfPlayers);
	const hasReachedMinimum = computed<boolean>(() => players.value.length >= minimumNumberOfPlayers);

	/* ---------------------------------------------------------------------- */

	/**
	 * Checks if the provided name is valid.
	 *
	 * @param name The name to validate.
	 *
	 * @returns True if the name is valid (not empty), false otherwise.
	 */
	function isValidName(name: string): boolean {
		return !isNilOrEmptyString(name);
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Adds a new player with the specified name.
	 *
	 * @param name The name of the player to add.
	 *
	 * @returns A feedback object indicating success or failure. In case of
	 *          success, the payload is the ID of the newly added player.
	 */
	function addNewPlayer(name: string): Feedback<{ id: Id }> {
		if (!isValidName(name)) return { success: false, message: t('error.invalidName') };

		const id: Id = generateId();

		playerStore.addPlayer({
			active: true,
			id,
			name
		});

		return { id, success: true };
	}

	/**
	 * Deletes a player by their ID.
	 *
	 * @param id The ID of the player to delete.
	 */
	function deletePlayer(id: Id): void {
		playerStore.removePlayerById(id);
	}

	/* ---------------------------------------------------------------------- */

	return {
		addNewPlayer,
		deletePlayer,
		hasExceededMaximum,
		hasPlayers,
		hasReachedMaximum,
		hasReachedMinimum,
		hasValidNumberOfActivePlayers,
		players: readonly(players)
	};
}

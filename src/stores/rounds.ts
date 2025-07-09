import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import {
	CurrentRoundAlreadyExistsError,
	NoCurrentRoundExistsError,
	PlayerIdNotFoundError
} from '@/errors';

/* ========================================================================== */

export type Scores = CompletedRound['scores'];

type UpdatableFields = Required<Pick<CurrentRound, 'currentPlayerId' | 'isBlocked' | 'phase' | 'winnerId'>>;

/* ========================================================================== */

export const useRoundsStore = defineStore('round', () => {
	/**
	 * A list of rounds.
	 */
	const rounds = ref<(CurrentRound | CompletedRound)[]>([]);

	/* ---------------------------------------------------------------------- */

	/**
	 * The rounds that have been completed, in the order they were completed.
	 */
	const completedRounds = computed<CompletedRound[]>(() => {
		return rounds.value.filter(round => !round.isCurrentRound);
	});

	/**
	 * The current round, if it exists.
	 */
	const currentRound = computed<CurrentRound | undefined>(() => {
		return rounds.value.find(round => round.isCurrentRound);
	});

	/**
	 * The ID of the current player in the current round, if it exists.
	 */
	const currentPlayerId = computed<Id | undefined>(() => currentRound.value?.currentPlayerId);

	/**
	 * Indicates whether there is a current round present in the store.
	 */
	const hasCurrentRound = computed<boolean>(() => currentRound.value !== undefined);

	const currentPlayerStats = computed<PlayerStats | undefined>(() => {
		if (currentRound.value === undefined) return undefined;
		if (currentPlayerId.value === undefined) return undefined;

		return currentRound.value.playerStats.find(player => player.id === currentPlayerId.value);
	});

	/**
	 * Retrieves the number of tiles a player has in the current round.
	 *
	 * @param playerId The ID of the player for whom to get the tile count.
	 *
	 * @returns The number of tiles the player has in the current round.
	 *
	 * @throws {NoCurrentRoundExistsError} If there is no current round present
	 *         in the store, an error is thrown to prevent accessing tile count
	 *         without a valid round.
	 * @throws {PlayerIdNotFoundError} If the player with the specified ID is
	 *         not found in the player stats of the current round, an error is
	 *         thrown to prevent accessing tile count for a non-existent player.
	 */
	function getCurrentRoundTileCountForPlayer(playerId: Id): number {
		if (currentRound.value === undefined) {
			throw new NoCurrentRoundExistsError('Unable to get tile count, no current round present for the game.');
		}
		const playerStats = currentRound.value.playerStats.find(player => player.id === playerId);
		if (playerStats === undefined) {
			throw new PlayerIdNotFoundError(`Player with ID ${playerId} not found in player stats of current round with ID "${currentRound.value.id}".`);
		}

		return playerStats.tiles;
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Retrieves the index of the current round.
	 *	 *
	 * @returns The index of the current round in the rounds array.
	 *
	 * @throws {RoundIdNotFoundError} If the round with the specified ID is
	 *         not found, an error is thrown.
	 */
	function getCurrentRoundIndex(): number {
		const round = currentRound.value;
		if (round === undefined) {
			throw new NoCurrentRoundExistsError(
				'Unable to get current round index, no current round present for the game.'
			);
		}

		const index = rounds.value.findIndex(item => item.id === round.id);
		if (index === -1) {
			throw new NoCurrentRoundExistsError(`Current round with ID ${round.id} not found in rounds store.`);
		}

		return index;
	}

	/**
	 * Checks if a player ID is present in the player stats of the
	 * current round.
	 *
	 * @param playerId The ID of the player to check.
	 *
	 * @returns True if the player ID is found in the player stats of the
	 *          current round, false otherwise.
	 */
	function isPlayerIdInCurrentRoundStats(playerId: Id): boolean {
		if (currentRound.value === undefined) return false;

		return currentRound.value.playerStats.some(player => player.id === playerId);
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Resets the rounds store by clearing all rounds.
	 */
	function $reset(): void {
		rounds.value = [];
	}

	/**
	 * Adds a new round to the list of rounds.
	 *
	 * @param round The round to add to the list.
	 *
	 * @throws {CurrentRoundAlreadyExistsError} If there is already a current
	 *         round present in the store, an error is thrown to prevent adding
	 *         multiple current rounds.
	 */
	function addRound(round: CurrentRound): void {
		if (currentRound.value !== undefined) {
			throw new CurrentRoundAlreadyExistsError(`Unable to add round, current round already exists with ID "${currentRound.value.id}"`);
		}

		rounds.value.push({ ...round });
	}

	/**
	 * Completes the current round with the provided scores.
	 *
	 * @param scores A record of scores for each player in the round, where the
	 *        keys are player IDs and the values are their scores.
	 *
	 * @throws {NoCurrentRoundExistsError} If there is no current round present
	 *         in the store, an error is thrown to prevent completing a
	 *         non-existent round.
	 */
	function completeCurrentRound(scores: Scores): void {
		const round = currentRound.value;
		if (round === undefined) {
			throw new NoCurrentRoundExistsError('Unable to complete round, no current round present for the game');
		}

		const completedRound: CompletedRound = {
			id: round.id,
			isCurrentRound: false,
			scores,
			winnerId: round.winnerId as Id
		};

		rounds.value = rounds.value.map(item => item.id === round?.id ? completedRound : item);
	}

	/**
	 * Updates the current round with a partial update.
	 *
	 * @param update A partial update to apply to the current round.
	 *
	 * @throws {NoCurrentRoundExistsError} If there is no current round
	 *         present in the store, an error is thrown to prevent updating a
	 *         non-existent round.
	 */
	function updateCurrentRound(update: Partial<UpdatableFields>): void {
		const index = getCurrentRoundIndex();

		rounds.value[index] = {
			...rounds.value[index],
			...update
		};
	}

	/**
	 * Updates the current round with the specified field and value.
	 *
	 * @param field The field to update in the current round.
	 * @param value The new value for the specified field.
	 *
	 * @throws {NoCurrentRoundExistsError} If there is no current round
	 *         present in the store, an error is thrown to prevent updating a
	 *         non-existent round.
	 */
	function updateCurrentRoundField<K extends keyof UpdatableFields>(field: K, value: CurrentRound[K]): void {
		const index = getCurrentRoundIndex();

		rounds.value[index] = {
			...rounds.value[index],
			[field]: value
		};
	}

	/**
	 * Updates player stats in the current round for the specified player.
	 *
	 * @param playerId The ID of the player whose stats are being updated.
	 * @param tilesDelta The change in the number of tiles for the current
	 *        player. This should be a positive number if the player has drawn
	 *        more than one tile, or a negative number if they have played a
	 *        tile without drawing any.
	 * @param scoreDelta The change in score for the current player. This should
	 *        be a positive number if the player has scored points, or a
	 *        negative number if they have lost points.
	 *
	 * @throws {NoCurrentRoundExistsError} If there is no current round present
	 *         in the store, an error is thrown to prevent updating a
	 *         non-existent round.
	 * @throws {NoCurrentPlayerError} If there is no current player present in
	 *         the current round with the specified ID.
	 */
	function updateCurrentRoundPlayerStats(playerId: Id, tilesDelta: number, scoreDelta: number): void {
		// Check if there is anything to update before proceeding.
		if (tilesDelta === 0 && scoreDelta === 0) return;

		const round = currentRound.value;
		if (round === undefined) {
			throw new NoCurrentRoundExistsError(
				'Unable to update player stats, no current round present for the game.'
			);
		}

		if (!isPlayerIdInCurrentRoundStats(playerId)) {
			throw new PlayerIdNotFoundError(`Player with ID ${playerId} not found in player stats of current round with ID "${round.id}".`);
		}

		const updatedPlayerStats: PlayerStats[] = round.playerStats.map(stats => {
			if (stats.id !== playerId) return stats;

			return {
				...stats,
				score: stats.score + scoreDelta,
				tiles: stats.tiles + tilesDelta
			};
		});

		const roundIndex = getCurrentRoundIndex();
		rounds.value[roundIndex] = {
			...rounds.value[roundIndex] as CurrentRound,
			playerStats: updatedPlayerStats
		};
	}

	/* ---------------------------------------------------------------------- */

	return {
		// State
		rounds,

		// Getters
		completedRounds,
		currentRound,
		currentPlayerId,
		currentPlayerStats,
		getCurrentRoundTileCountForPlayer,
		hasCurrentRound,

		// Actions
		$reset,
		addRound,
		completeCurrentRound,
		updateCurrentRound,
		updateCurrentRoundField,
		updateCurrentRoundPlayerStats
	};
}, {
	persist: {
		storage: localStorage
	}
});

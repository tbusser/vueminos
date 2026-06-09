import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import {
	CurrentRoundAlreadyExistsError,
	NoCurrentRoundExistsError,
	PlayerIdNotFoundError
} from '@/errors';

import { addNewCurrentRoundToStore, createCurrentRound } from '@/test-factories';

import { generateId } from '@/utilities/id';

import { useRoundsStore } from './rounds';
import { useRules } from '@/composables/useRules';

/* ========================================================================== */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Rounds Store', () => {
	describe('addRound', () => {
		it('should add a round to the rounds store', () => {
			const round = createCurrentRound([generateId()]);

			const roundsStore = useRoundsStore();
			roundsStore.addRound(round);

			expect(roundsStore.rounds).toHaveLength(1);
			expect(roundsStore.rounds[0]).toEqual(round);
			expect(roundsStore.rounds[0]).not.toBe(round);
		});

		it('should throw an error if there is already a current round', () => {
			const roundsStore = useRoundsStore();

			roundsStore.addRound(createCurrentRound([generateId()]));

			expect(() =>
				roundsStore.addRound(createCurrentRound([generateId()]))
			).toThrow(CurrentRoundAlreadyExistsError);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('completeCurrentRound', () => {
		it('should throw an error if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(() => roundsStore.completeCurrentRound({})).toThrow(NoCurrentRoundExistsError);
		});

		it('should throw an error if there is no winner ID set for the current round', () => {
			addNewCurrentRoundToStore([generateId()]);
			const roundsStore = useRoundsStore();

			expect(() => roundsStore.completeCurrentRound({})).toThrow(PlayerIdNotFoundError);
		});

		it('should throw error when winner is not found in the player stats of the current round', () => {
			addNewCurrentRoundToStore([generateId()]);
			const roundsStore = useRoundsStore();

			roundsStore.updateCurrentRound({
				winnerId: generateId()
			});

			expect(() => roundsStore.completeCurrentRound({})).toThrow(PlayerIdNotFoundError);
		});

		it('should complete the current round with the provided scores', () => {
			const playerId = generateId();
			const round = addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({
				winnerId: playerId
			});
			roundsStore.completeCurrentRound({
				[playerId]: 42
			});

			expect(roundsStore.rounds).toHaveLength(1);
			expect(roundsStore.currentRound).toBeUndefined();
			expect(roundsStore.completedRounds).toHaveLength(1);
			expect(roundsStore.completedRounds[0]).toEqual({
				id: round.id,
				isCurrentRound: false,
				scores: { [playerId]: 42 },
				winnerId: playerId
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updateCurrentRound', () => {
		it('should throw an error if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(() => roundsStore.updateCurrentRound({})).toThrow(NoCurrentRoundExistsError);
		});

		it('should throw an error if the player is not found in the current round', () => {
			const roundsStore = useRoundsStore();
			addNewCurrentRoundToStore([generateId()]);

			expect(
				() => roundsStore.updateCurrentRound({ currentPlayerId: generateId() })
			).toThrow(PlayerIdNotFoundError);
		});

		it('should update the current round with the provided update', () => {
			const roundsStore = useRoundsStore();
			const round = addNewCurrentRoundToStore([generateId()]);

			roundsStore.updateCurrentRound({
				phase: 'round-end',
				isBlocked: true
			});

			expect(roundsStore.currentRound).toEqual({
				...round,
				phase: 'round-end',
				isBlocked: true
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updateCurrentRoundPlayerStats', () => {
		it('should throw an error if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(() =>
				roundsStore.updateCurrentRoundPlayerStats(generateId(), 1, 1)
			).toThrow(NoCurrentRoundExistsError);
		});

		it('should throw an error if the player is not found in the current round', () => {
			addNewCurrentRoundToStore([generateId()]);
			const roundsStore = useRoundsStore();

			expect(() =>
				roundsStore.updateCurrentRoundPlayerStats(generateId(), 1, 1)
			).toThrow(PlayerIdNotFoundError);
		});

		it('should do nothing when both tiles and score are 0', () => {
			const playerId = generateId();
			const round = addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRoundPlayerStats(playerId, 0, 0);

			expect(roundsStore.currentRound).toEqual(round);
		});

		it('should update score when only scoreDelta is non-zero', () => {
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRoundPlayerStats(playerId, 0, 10);

			expect(roundsStore.currentRound?.playerStats[0]).toEqual({
				id: playerId,
				score: 10,
				tiles: 0
			});
		});

		it('should update tiles when only tilesDelta is non-zero', () => {
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRoundPlayerStats(playerId, 2, 0);

			expect(roundsStore.currentRound?.playerStats[0]).toEqual({
				id: playerId,
				score: 0,
				tiles: 2
			});
		});

		it('should update the current round player stats with the provided update', () => {
			const initialTiles = useRules().determineTilesPerPlayer(2);
			const playerA = generateId();
			const playerB = generateId();
			const round = addNewCurrentRoundToStore([playerA, playerB]);

			const roundsStore = useRoundsStore();
			const pickedTilesCount = 2;
			roundsStore.updateCurrentRoundPlayerStats(playerA, pickedTilesCount, 10);

			expect(roundsStore.currentRound).toEqual({
				...round,
				playerStats: [
					{ id: playerA, score: 10, tiles: initialTiles + pickedTilesCount },
					{ id: playerB, score: 0, tiles: initialTiles }
				]
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('completedRounds', () => {
		it('should return an empty array if there are no completed rounds', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.completedRounds).toEqual([]);
		});

		it('should return the completed rounds in the order they were completed', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			const roundA = createCurrentRound([playerId]);
			const roundB = createCurrentRound([playerId]);

			roundsStore.addRound(roundA);
			roundsStore.updateCurrentRound({ winnerId: playerId });
			roundsStore.completeCurrentRound({ [playerId]: 42 });

			roundsStore.addRound(roundB);
			roundsStore.updateCurrentRound({ winnerId: playerId });
			roundsStore.completeCurrentRound({ [playerId]: 13 });

			roundsStore.addRound(createCurrentRound([playerId]));

			expect(roundsStore.completedRounds).toHaveLength(2);
			expect(roundsStore.completedRounds[0]).toEqual({
				id: roundA.id,
				isCurrentRound: false,
				scores: { [playerId]: 42 },
				winnerId: playerId
			});
			expect(roundsStore.completedRounds[1]).toEqual({
				id: roundB.id,
				isCurrentRound: false,
				scores: { [playerId]: 13 },
				winnerId: playerId
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentPlayerId', () => {
		it('should return undefined if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.currentPlayerId).toBeUndefined();
		});

		it('should return undefined if there is a current round but no player has been set', () => {
			const roundsStore = useRoundsStore();
			// Manually create a current round, the factory method doesn't allow
			// creating a current round with no player stats
			roundsStore.addRound({
				id: generateId(),
				isCurrentRound: true,
				phase: 'player-select',
				playerStats: []
			});

			expect(roundsStore.currentPlayerId).toBeUndefined();
		});

		it('should return the current player ID if there is a current round', () => {
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ currentPlayerId: playerId });

			expect(roundsStore.currentPlayerId).toEqual(playerId);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentPlayerStats', () => {
		it('should return undefined if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.currentPlayerStats).toBeUndefined();
		});

		it('should return undefined if there is a current round but no player has been set', () => {
			addNewCurrentRoundToStore([generateId()]);

			const roundsStore = useRoundsStore();

			expect(roundsStore.currentPlayerStats).toBeUndefined();
		});

		it('should return the current player stats if there is a current round and a player has been set', () => {
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ currentPlayerId: playerId });
			roundsStore.updateCurrentRoundPlayerStats(playerId, 10, 5);

			expect(roundsStore.currentPlayerStats).toEqual({
				id: playerId, score: 5, tiles: 10
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentRound', () => {
		it('should return undefined if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.currentRound).toBeUndefined();
		});

		it('should return the current round if there is a current round', () => {
			const round = addNewCurrentRoundToStore([generateId()]);

			const roundsStore = useRoundsStore();

			expect(roundsStore.currentRound).toEqual(round);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentRoundOrdinal', () => {
		it('should return undefined if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.currentRoundOrdinal).toBeUndefined();
		});

		it('should return 1 for the first round', () => {
			addNewCurrentRoundToStore([generateId()]);

			const roundsStore = useRoundsStore();

			expect(roundsStore.currentRoundOrdinal).toEqual(1);
		});

		it('should return the ordinal for subsequent rounds', () => {
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ winnerId: playerId });
			roundsStore.completeCurrentRound({ [playerId]: 42 });

			addNewCurrentRoundToStore([playerId]);

			expect(roundsStore.currentRoundOrdinal).toEqual(2);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('getCurrentRoundTileCountForPlayer', () => {
		it('should throw an error if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(() =>
				roundsStore.getCurrentRoundTileCountForPlayer(generateId())
			).toThrow(NoCurrentRoundExistsError);
		});

		it('should throw an error if the player is not found in the current round', () => {
			addNewCurrentRoundToStore([generateId()]);
			const roundsStore = useRoundsStore();

			expect(() =>
				roundsStore.getCurrentRoundTileCountForPlayer(generateId())
			).toThrow(PlayerIdNotFoundError);
		});

		it('should return the number of tiles for the player in the current round', () => {
			const initialTiles = useRules().determineTilesPerPlayer(2);
			const playerId = generateId();
			// A valid game needs at least two players.
			addNewCurrentRoundToStore([playerId, generateId()]);

			const pickedTilesCount = 2;
			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRoundPlayerStats(playerId, pickedTilesCount, 0);

			expect(roundsStore.getCurrentRoundTileCountForPlayer(playerId)).toEqual(initialTiles + pickedTilesCount);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasCurrentRound', () => {
		it('should return false if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.hasCurrentRound).toBe(false);
		});

		it('should return true if there is a current round', () => {
			addNewCurrentRoundToStore([generateId()]);

			const roundsStore = useRoundsStore();

			expect(roundsStore.hasCurrentRound).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('$reset', () => {
		it('should reset the rounds store', () => {
			addNewCurrentRoundToStore([generateId()]);

			const roundsStore = useRoundsStore();
			roundsStore.$reset();

			expect(roundsStore.rounds).toHaveLength(0);
		});
	});
});

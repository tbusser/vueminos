import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import {
	CurrentRoundAlreadyExistsError,
	NoCurrentRoundExistsError,
	PlayerIdNotFoundError
} from '@/errors';

import { generateId } from '@/utilities/id';

import { useRoundsStore } from './rounds';

/* ========================================================================== */

function createCurrentRound(playerIds: Id[] = []): CurrentRound {
	return {
		id: generateId(),
		isCurrentRound: true,
		phase: 'player-select',
		playerStats: playerIds.map(id => ({ id, score: 0, tiles: 0 }))
	} satisfies CurrentRound;
}

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Rounds Store', () => {
	describe('addRound', () => {
		it('should add a round to the rounds store', () => {
			const roundsStore = useRoundsStore();
			const round = createCurrentRound();

			roundsStore.addRound(round);

			expect(roundsStore.rounds).toHaveLength(1);
			expect(roundsStore.rounds[0]).toEqual(round);
			expect(roundsStore.rounds[0]).not.toBe(round);
		});

		it('should throw an error if there is already a current round', () => {
			const roundsStore = useRoundsStore();

			roundsStore.addRound(createCurrentRound());

			expect(() => roundsStore.addRound(createCurrentRound())).toThrow(CurrentRoundAlreadyExistsError);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('completeCurrentRound', () => {
		it('should throw an error if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(() => roundsStore.completeCurrentRound({})).toThrow(NoCurrentRoundExistsError);
		});

		it('should throw an error if there is no winner ID set for the current round', () => {
			const roundsStore = useRoundsStore();
			roundsStore.addRound(createCurrentRound());

			expect(() => roundsStore.completeCurrentRound({})).toThrow(PlayerIdNotFoundError);
		});

		it('should throw error when winner is not found in the player stats of the current round', () => {
			const roundsStore = useRoundsStore();
			// playerStats is empty, so any winnerId is invalid.
			roundsStore.addRound(createCurrentRound());

			roundsStore.updateCurrentRound({
				winnerId: generateId()
			});

			expect(() => roundsStore.completeCurrentRound({})).toThrow(PlayerIdNotFoundError);
		});

		it('should complete the current round with the provided scores', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			const round = createCurrentRound([playerId]);
			roundsStore.addRound(round);

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
			const round = createCurrentRound();
			roundsStore.addRound(round);

			expect(
				() => roundsStore.updateCurrentRound({ currentPlayerId: generateId() })
			).toThrow(PlayerIdNotFoundError);
		});

		it('should update the current round with the provided update', () => {
			const roundsStore = useRoundsStore();
			const round = createCurrentRound();
			roundsStore.addRound(round);

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
			const roundsStore = useRoundsStore();
			// playerStats is empty, so any playerId is invalid
			const round = createCurrentRound();

			roundsStore.addRound(round);

			expect(() =>
				roundsStore.updateCurrentRoundPlayerStats(generateId(), 1, 1)
			).toThrow(PlayerIdNotFoundError);
		});

		it('should do nothing when both tiles and score are 0', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			const round = createCurrentRound([playerId]);

			roundsStore.addRound(round);
			roundsStore.updateCurrentRoundPlayerStats(playerId, 0, 0);

			expect(roundsStore.currentRound).toEqual(round);
		});

		it('should update score when only scoreDelta is non-zero', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();

			roundsStore.addRound(createCurrentRound([playerId]));
			roundsStore.updateCurrentRoundPlayerStats(playerId, 0, 10);

			expect(roundsStore.currentRound?.playerStats[0]).toEqual({
				id: playerId,
				score: 10,
				tiles: 0
			});
		});

		it('should update tiles when only tilesDelta is non-zero', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();

			roundsStore.addRound(createCurrentRound([playerId]));
			roundsStore.updateCurrentRoundPlayerStats(playerId, 2, 0);

			expect(roundsStore.currentRound?.playerStats[0]).toEqual({
				id: playerId,
				score: 0,
				tiles: 2
			});
		});

		it('should update the current round player stats with the provided update', () => {
			const roundsStore = useRoundsStore();
			const playerA = generateId();
			const playerB = generateId();
			const round = createCurrentRound([playerA, playerB]);

			roundsStore.addRound(round);
			roundsStore.updateCurrentRoundPlayerStats(playerA, 2, 10);

			expect(roundsStore.currentRound).toEqual({
				...round,
				playerStats: [
					{ id: playerA, score: 10, tiles: 2 },
					{ id: playerB, score: 0, tiles: 0 }
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

			roundsStore.addRound(createCurrentRound());

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
			roundsStore.addRound(createCurrentRound());

			expect(roundsStore.currentPlayerId).toBeUndefined();
		});

		it('should return the current player ID if there is a current round', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			const round = createCurrentRound([playerId]);

			roundsStore.addRound(round);
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
			const roundsStore = useRoundsStore();
			const round = createCurrentRound([generateId()]);
			roundsStore.addRound(round);

			expect(roundsStore.currentPlayerStats).toBeUndefined();
		});

		it('should return the current player stats if there is a current round and a player has been set', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			const round = createCurrentRound([playerId]);

			roundsStore.addRound(round);
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
			const roundsStore = useRoundsStore();
			const round = createCurrentRound();
			roundsStore.addRound(round);

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
			const roundsStore = useRoundsStore();

			roundsStore.addRound(createCurrentRound());

			expect(roundsStore.currentRoundOrdinal).toEqual(1);
		});

		it('should return the ordinal for subsequent rounds', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			const round = createCurrentRound([playerId]);

			roundsStore.addRound(round);
			roundsStore.updateCurrentRound({ winnerId: playerId });
			roundsStore.completeCurrentRound({ [playerId]: 42 });
			roundsStore.addRound(createCurrentRound());

			expect(roundsStore.currentRoundOrdinal).toEqual(2);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentRoundScore', () => {
		it('should return an empty object if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.currentRoundScore).toEqual({});
		});

		it('should return an empty object if the current round has no players', () => {
			const roundsStore = useRoundsStore();

			roundsStore.addRound(createCurrentRound());

			expect(roundsStore.currentRoundScore).toEqual({});
		});

		it('should return a score of 0 for each player when no scores have been recorded', () => {
			const roundsStore = useRoundsStore();
			const playerA = generateId();
			const playerB = generateId();

			roundsStore.addRound(createCurrentRound([playerA, playerB]));

			expect(roundsStore.currentRoundScore).toEqual({
				[playerA]: 0,
				[playerB]: 0
			});
		});

		it('should reflect scores updated via updateCurrentRoundPlayerStats', () => {
			const roundsStore = useRoundsStore();
			const playerA = generateId();
			const playerB = generateId();

			roundsStore.addRound(createCurrentRound([playerA, playerB]));
			roundsStore.updateCurrentRoundPlayerStats(playerA, 0, 15);
			roundsStore.updateCurrentRoundPlayerStats(playerB, 0, 7);

			expect(roundsStore.currentRoundScore).toEqual({
				[playerA]: 15,
				[playerB]: 7
			});
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
			const roundsStore = useRoundsStore();

			roundsStore.addRound(createCurrentRound());

			expect(() =>
				roundsStore.getCurrentRoundTileCountForPlayer(generateId())
			).toThrow(PlayerIdNotFoundError);
		});

		it('should return the number of tiles for the player in the current round', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			const round = createCurrentRound([playerId]);

			roundsStore.addRound(round);
			roundsStore.updateCurrentRoundPlayerStats(playerId, 2, 0);

			expect(roundsStore.getCurrentRoundTileCountForPlayer(playerId)).toEqual(2);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasCurrentRound', () => {
		it('should return false if there is no current round', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.hasCurrentRound).toBe(false);
		});

		it('should return true if there is a current round', () => {
			const roundsStore = useRoundsStore();

			roundsStore.addRound(createCurrentRound());

			expect(roundsStore.hasCurrentRound).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('playerScores', () => {
		it('should return an empty object if there are no rounds', () => {
			const roundsStore = useRoundsStore();

			expect(roundsStore.playerScores).toEqual({});
		});

		it('should return the accumulated scores from completed rounds only', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();

			roundsStore.addRound(createCurrentRound([playerId]));
			roundsStore.updateCurrentRound({ winnerId: playerId });
			roundsStore.completeCurrentRound({ [playerId]: 42 });

			roundsStore.addRound(createCurrentRound([playerId]));
			roundsStore.updateCurrentRound({ winnerId: playerId });
			roundsStore.completeCurrentRound({ [playerId]: 13 });

			expect(roundsStore.playerScores).toEqual({ [playerId]: 55 });
		});

		it('should return accumulated scores per player from completed rounds', () => {
			const roundsStore = useRoundsStore();
			const player1Id = generateId();
			const player2Id = generateId();

			roundsStore.addRound(createCurrentRound([player1Id, player2Id]));
			roundsStore.updateCurrentRound({ winnerId: player1Id });
			roundsStore.completeCurrentRound({ [player1Id]: 42, [player2Id]: 30 });
			roundsStore.addRound(createCurrentRound([player1Id, player2Id]));
			roundsStore.updateCurrentRound({ winnerId: player2Id });
			roundsStore.completeCurrentRound({ [player1Id]: 13, [player2Id]: 20 });

			expect(roundsStore.playerScores).toEqual({
				[player1Id]: 55,
				[player2Id]: 50
			});
		});

		it('should return the combined scores from completed and current rounds', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();

			roundsStore.addRound(createCurrentRound([playerId]));
			roundsStore.updateCurrentRound({ winnerId: playerId });
			roundsStore.completeCurrentRound({ [playerId]: 42 });

			roundsStore.addRound(createCurrentRound([playerId]));
			roundsStore.updateCurrentRoundPlayerStats(playerId, 0, 10);

			expect(roundsStore.playerScores).toEqual({ [playerId]: 52 });
		});

		it('should return combined scores per player from completed and current rounds', () => {
			const roundsStore = useRoundsStore();
			const player1Id = generateId();
			const player2Id = generateId();

			roundsStore.addRound(createCurrentRound([player1Id, player2Id]));
			roundsStore.updateCurrentRound({ winnerId: player1Id });
			roundsStore.completeCurrentRound({ [player1Id]: 42, [player2Id]: 30 });
			roundsStore.addRound(createCurrentRound([player1Id, player2Id]));
			roundsStore.updateCurrentRoundPlayerStats(player1Id, 0, 10);
			roundsStore.updateCurrentRoundPlayerStats(player2Id, 0, 15);

			expect(roundsStore.playerScores).toEqual({
				[player1Id]: 52,
				[player2Id]: 45
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('$reset', () => {
		it('should reset the rounds store', () => {
			const roundsStore = useRoundsStore();
			const playerId = generateId();
			roundsStore.addRound(createCurrentRound([playerId]));

			roundsStore.$reset();

			expect(roundsStore.rounds).toHaveLength(0);
		});
	});
});

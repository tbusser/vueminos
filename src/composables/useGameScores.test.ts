import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { generateId } from '@/utilities/id';

import { useGameStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/players';
import { useRoundsStore } from '@/stores/rounds';

import { useGameScores } from './useGameScores';

/* ========================================================================== */

function createGame(limit: number): void {
	useGameStore().createNewGame(limit);
}

function createRounds(rounds: Round[]): void {
	useRoundsStore().$patch({ rounds });
}

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useGameScores', () => {
	describe('hasReachedPointsLimit', () => {
		it('should return false when there are no player scores', () => {
			createGame(100);

			const { hasReachedPointsLimit } = useGameScores();

			expect(hasReachedPointsLimit.value).toBe(false);
		});

		it('should return false when the points limit has not been reached', () => {
			const playerId1 = generateId();
			const playerId2 = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId1]: 40, [playerId2]: 60 },
				winnerId: playerId1
			}]);

			const { hasReachedPointsLimit } = useGameScores();

			expect(hasReachedPointsLimit.value).toBe(false);
		});

		it('should return true when a score has exactly reached the points limit', () => {
			const playerId = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId]: 100 },
				winnerId: playerId
			}]);

			const { hasReachedPointsLimit } = useGameScores();

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should return true when a score exceeds the points limit', () => {
			const playerId = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId]: 120 },
				winnerId: playerId
			}]);

			const { hasReachedPointsLimit } = useGameScores();

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should consider scores accumulated across multiple completed rounds', () => {
			const playerId = generateId();

			createGame(100);
			createRounds([
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 60 },
					winnerId: playerId
				},
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 50 },
					winnerId: playerId
				}
			]);

			const { hasReachedPointsLimit } = useGameScores();

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should include the current round scores in the calculation', () => {
			const playerId = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: true,
				phase: 'turns',
				playerStats: [{ id: playerId, score: 105, tiles: 3 }]
			}]);

			const { hasReachedPointsLimit } = useGameScores();

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should return true when combined completed and current round scores reach the limit', () => {
			const playerId = generateId();

			createGame(100);
			createRounds([
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 60 },
					winnerId: playerId
				},
				{
					id: generateId(),
					isCurrentRound: true,
					phase: 'turns',
					playerStats: [{ id: playerId, score: 40, tiles: 3 }]
				}
			]);

			const { hasReachedPointsLimit } = useGameScores();

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should return true synchronously after a current round is completed past the limit', () => {
			const playerId = generateId();
			const roundsStore = useRoundsStore();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: true,
				phase: 'round-end',
				playerStats: [{ id: playerId, score: 110, tiles: 0 }],
				winnerId: playerId
			}]);

			const { hasReachedPointsLimit } = useGameScores();

			roundsStore.completeCurrentRound({ [playerId]: 110 });

			expect(hasReachedPointsLimit.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('totalScore', () => {
		it('should return an empty object if there are no rounds', () => {
			const { totalScore } = useGameScores();

			expect(totalScore.value).toEqual({});
		});

		it('should return the accumulated scores from completed rounds only', () => {
			const playerId = generateId();

			createRounds([
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 42 },
					winnerId: playerId
				},
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 13 },
					winnerId: playerId
				}
			]);

			const { totalScore } = useGameScores();

			expect(totalScore.value).toEqual({ [playerId]: 55 });
		});

		it('should return accumulated scores per player from completed rounds', () => {
			const player1Id = generateId();
			const player2Id = generateId();

			createRounds([
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [player1Id]: 42, [player2Id]: 30 },
					winnerId: player1Id
				},
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [player1Id]: 13, [player2Id]: 20 },
					winnerId: player2Id
				}
			]);

			const { totalScore } = useGameScores();

			expect(totalScore.value).toEqual({
				[player1Id]: 55,
				[player2Id]: 50
			});
		});

		it('should return the combined scores from completed and current rounds', () => {
			const playerId = generateId();

			createRounds([
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 42 },
					winnerId: playerId
				},
				{
					id: generateId(),
					isCurrentRound: true,
					phase: 'turns',
					playerStats: [{ id: playerId, score: 10, tiles: 3 }]
				}
			]);

			const { totalScore } = useGameScores();

			expect(totalScore.value).toEqual({ [playerId]: 52 });
		});

		it('should return combined scores per player from completed and current rounds', () => {
			const player1Id = generateId();
			const player2Id = generateId();

			createRounds([
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [player1Id]: 42, [player2Id]: 30 },
					winnerId: player1Id
				},
				{
					id: generateId(),
					isCurrentRound: true,
					phase: 'turns',
					playerStats: [{ id: player1Id, score: 10, tiles: 3 }, { id: player2Id, score: 15, tiles: 3 }]
				}
			]);

			const { totalScore } = useGameScores();

			expect(totalScore.value).toEqual({
				[player1Id]: 52,
				[player2Id]: 45
			});
		});

		it('should include a round completed after composable creation', () => {
			const playerId = generateId();
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId]: 40 },
				winnerId: playerId
			}]);

			const { totalScore } = useGameScores();

			createRounds([
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 40 },
					winnerId: playerId
				},
				{
					id: generateId(),
					isCurrentRound: false,
					scores: { [playerId]: 20 },
					winnerId: playerId
				}
			]);

			expect(totalScore.value).toEqual({ [playerId]: 60 });
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('winner', () => {
		it('should return undefined when the points limit has not been reached', () => {
			const { winner } = useGameScores();

			createGame(100);

			expect(winner.value).toBeUndefined();
		});

		it('should return undefined when the winning player ID is not found in the players store', () => {
			const playerId = generateId();

			createGame(100);
			// Intentionally not adding the player to the players store.
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId]: 120 },
				winnerId: playerId
			}]);

			const { winner } = useGameScores();

			expect(winner.value).toBeUndefined();
		});

		it('should return the player with the highest score when the limit is reached', () => {
			const playersStore = usePlayersStore();
			const player1: Player = { active: true, id: generateId(), name: 'Alice' };
			const player2: Player = { active: true, id: generateId(), name: 'Bob' };

			createGame(100);
			playersStore.addPlayer(player1);
			playersStore.addPlayer(player2);
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [player1.id]: 120, [player2.id]: 80 },
				winnerId: player1.id
			}]);

			const { winner } = useGameScores();

			expect(winner.value).toMatchObject({ id: player1.id, name: 'Alice' });
		});
	});
});

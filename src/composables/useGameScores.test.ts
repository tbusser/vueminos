import { beforeEach, describe, expect, it } from 'vitest';
import { useGameScores } from './useGameScores';
import { useGameStore } from '@/stores/game';
import { useRoundsStore } from '@/stores/rounds';
import { generateId } from '@/utilities/id';
import { createPinia, setActivePinia } from 'pinia';
import { usePlayersStore } from '@/stores/players';

/* ========================================================================== */

function createGame(limit: number = 100): void {
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
			const { hasReachedPointsLimit } = useGameScores();

			createGame(100);

			expect(hasReachedPointsLimit.value).toBe(false);
		});

		it('should return false when the points limit has not been reached', () => {
			const { hasReachedPointsLimit } = useGameScores();
			const playerId1 = generateId();
			const playerId2 = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId1]: 40, [playerId2]: 60 },
				winnerId: playerId1
			}]);

			expect(hasReachedPointsLimit.value).toBe(false);
		});

		it('should return true when a score has exactly reached the points limit', () => {
			const { hasReachedPointsLimit } = useGameScores();
			const playerId = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId]: 100 },
				winnerId: playerId
			}]);

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should return true when a score exceeds the points limit', () => {
			const { hasReachedPointsLimit } = useGameScores();
			const playerId = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId]: 120 },
				winnerId: playerId
			}]);

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should consider scores accumulated across multiple completed rounds', () => {
			const { hasReachedPointsLimit } = useGameScores();
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

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should include the current round scores in the calculation', () => {
			const { hasReachedPointsLimit } = useGameScores();
			const playerId = generateId();

			createGame(100);
			createRounds([{
				id: generateId(),
				isCurrentRound: true,
				phase: 'turns',
				playerStats: [{ id: playerId, score: 105, tiles: 3 }]
			}]);

			expect(hasReachedPointsLimit.value).toBe(true);
		});

		it('should return true when combined completed and current round scores reach the limit', () => {
			const { hasReachedPointsLimit } = useGameScores();
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

			expect(hasReachedPointsLimit.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('totalScore', () => {
		it('should combine scores from completed and current rounds', () => {
			const { totalScore } = useGameScores();
			const playerId = generateId();

			createGame(200);
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
					playerStats: [{ id: playerId, score: 25, tiles: 2 }]
				}
			]);

			expect(totalScore.value[playerId]).toBe(85);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('winner', () => {
		it('should return undefined when the points limit has not been reached', () => {
			const { winner } = useGameScores();
			const playersStore = usePlayersStore();
			const player: Player = { active: true, id: generateId(), name: 'Alice' };

			createGame(100);
			playersStore.addPlayer(player);

			expect(winner.value).toBeUndefined();
		});

		it('should return undefined when the winning player ID is not found in the players store', () => {
			const { winner } = useGameScores();
			const playerId = generateId();

			createGame(100);
			// Intentionally not adding the player to the players store.
			createRounds([{
				id: generateId(),
				isCurrentRound: false,
				scores: { [playerId]: 120 },
				winnerId: playerId
			}]);

			expect(winner.value).toBeUndefined();
		});

		it('should return the player with the highest score when the limit is reached', () => {
			const { winner } = useGameScores();
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

			expect(winner.value).toMatchObject({ id: player1.id, name: 'Alice' });
		});
	});
});

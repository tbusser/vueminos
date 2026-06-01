import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRoundsLogic } from './useRoundsLogic';
import { generateId } from '@/utilities/id';
import { createPinia, setActivePinia } from 'pinia';
import { useTurnsStore } from '@/stores/turns';
import {
	addNewCurrentRoundToStore,
	addNewGameToStore,
	addNewTurnsToStore,
	createPlayedTurn,
	createPlayer,
	createSkippedTurn
} from '@/test-factories';
import { useRoundsStore } from '@/stores/rounds';
import { usePlayersStore } from '@/stores/players';
import { useRules } from './useRules';

/* ========================================================================== */

vi.mock('@/i18n');

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useRoundsLogic', () => {
	describe('currentRoundOrdinal', () => {
		/**
		 * currentRoundOrdinal is already tested in the rounds store test suite,
		 * so we only need to test that it is updated correctly when the current
		 * round is finished.
		 */
		it('should reflect the correct ordinal as rounds progress', () => {
			const roundsLogic = useRoundsLogic();

			const roundsStore = useRoundsStore();
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			expect(roundsLogic.currentRoundOrdinal.value).toEqual(1);

			roundsStore.updateCurrentRound({
				phase: 'round-end',
				winnerId: playerId
			});
			roundsLogic.finishCurrentRound({ [playerId]: 0 });

			addNewCurrentRoundToStore([playerId]);
			expect(roundsLogic.currentRoundOrdinal.value).toEqual(2);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('finishCurrentRound', () => {
		it('should return a failure when there is no current round', () => {
			const roundsLogic = useRoundsLogic();

			const result = roundsLogic.finishCurrentRound({});

			expect(result).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should throw an error when there is no winner ID set for the current round', () => {
			const roundsLogic = useRoundsLogic();

			addNewCurrentRoundToStore([generateId()]);

			expect(roundsLogic.finishCurrentRound({ [generateId()]: 0 })).toEqual(
				{ success: false, message: 'No winner ID set for the current round' }
			);
		});

		it('should return a failure when the winner ID is not in the round player stats', () => {
			const roundsLogic = useRoundsLogic();

			const playerId = generateId();
			const winnerId = generateId();

			addNewCurrentRoundToStore([playerId]);
			useRoundsStore().updateCurrentRound({ winnerId });

			expect(roundsLogic.finishCurrentRound({ [playerId]: 0 })).toEqual(
				{ success: false, message: 'No winner ID set for the current round' }
			);
		});

		it('should complete the current round and return success when the winner is valid', () => {
			const roundsLogic = useRoundsLogic();

			const playerId = generateId();
			const scores = { [playerId]: 100 };

			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ winnerId: playerId });

			const result = roundsLogic.finishCurrentRound(scores);

			expect(result).toEqual({ success: true });
			expect(roundsStore.currentRound).toBeUndefined();
			expect(roundsStore.completedRounds).toHaveLength(1);
			expect(roundsStore.completedRounds[0]).toMatchObject({ winnerId: playerId, scores });
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('saveTurn', () => {
		it('should return a failure when there is no current round', () => {
			const roundsLogic = useRoundsLogic();

			const result = roundsLogic.saveTurn(createSkippedTurn(generateId()));

			expect(result).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should return a failure when there is no current player', () => {
			addNewCurrentRoundToStore([generateId()], 'player-select');
			const roundsLogic = useRoundsLogic();

			const result = roundsLogic.saveTurn(createSkippedTurn(generateId()));

			expect(result).toEqual({ success: false, message: 'error.noCurrentPlayer' });
		});

		it('should return success and add the turn to the turns store with the current player ID', () => {
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerId });

			const roundsLogic = useRoundsLogic();

			const scoredTurn: ScoredTurnInput = {
				tilesDrawn: 1,
				tilesPlayed: 1,
				tileValue: 6,
				bonusBridge: false,
				bonusDouble: false,
				bonusHexagon: false,
				triple: false,
				score: 6
			};

			const result = roundsLogic.saveTurn(scoredTurn);

			expect(result).toEqual({ success: true });
			expect(useTurnsStore().turns).toHaveLength(1);
			expect(useTurnsStore().turns[0]).toMatchObject({ ...scoredTurn, playerId });
		});

		it('should update the current player stats with the tile delta and score', () => {
			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ currentPlayerId: playerId });

			const initialTiles = roundsStore.currentRound!.playerStats.find(s => s.id === playerId)!.tiles;

			const roundsLogic = useRoundsLogic();

			// tilesDrawn: 2, tilesPlayed: 1 → net tile delta: +1
			roundsLogic.saveTurn({
				tilesDrawn: 2,
				tilesPlayed: 1,
				tileValue: 6,
				bonusBridge: false,
				bonusDouble: false,
				bonusHexagon: false,
				triple: false,
				score: 6
			});

			const updatedStats = roundsStore.currentRound!.playerStats.find(s => s.id === playerId)!;
			expect(updatedStats.score).toBe(6);
			expect(updatedStats.tiles).toBe(initialTiles + 1);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('startNewRound', () => {
		it('should return a failure when there is no active game', () => {
			const roundsLogic = useRoundsLogic();

			const result = roundsLogic.startNewRound();

			expect(result).toEqual({ success: false, message: 'error.noActiveGame' });
		});

		it('should return a failure when there is already a current round', () => {
			addNewGameToStore(100);
			addNewCurrentRoundToStore([generateId()]);
			const roundsLogic = useRoundsLogic();

			const result = roundsLogic.startNewRound();

			expect(result).toEqual({ success: false, message: 'error.hasCurrentRound' });
		});

		it('should return success and add a new current round to the rounds store', () => {
			addNewGameToStore(100);
			const roundsLogic = useRoundsLogic();

			const result = roundsLogic.startNewRound();

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound).toBeDefined();
		});

		it('should initialize player stats for all active players', () => {
			addNewGameToStore(100);

			const playerIds = [generateId(), generateId()];
			const { addPlayer } = usePlayersStore();
			playerIds.forEach((id, index) => addPlayer(createPlayer(index.toString(), id)));

			useRoundsLogic().startNewRound();

			const { playerStats } = useRoundsStore().currentRound!;
			const initialTileCount = useRules().determineStonesPerPlayer(playerIds.length);

			expect(playerStats).toHaveLength(playerIds.length);
			playerStats.forEach(stat => {
				expect(playerIds).toContain(stat.id);
				expect(stat.score).toBe(0);
				expect(stat.tiles).toBe(initialTileCount);
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updateTurn', () => {
		it('should return a failure when there is no current round', () => {
			const roundsLogic = useRoundsLogic();

			const scoredTurn: ScoredTurnInput = {
				tilesDrawn: 1,
				tilesPlayed: 0,
				tileValue: undefined,
				score: 0
			};

			const result = roundsLogic.updateTurn(generateId(), generateId(), scoredTurn);

			expect(result).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should return a failure when the turn is not found', () => {
			addNewCurrentRoundToStore([generateId()]);

			const playerId = generateId();
			const result = useRoundsLogic().updateTurn(playerId, generateId(), createSkippedTurn(playerId));

			expect(result).toEqual({ success: false, message: 'error.turnNotFound' });
		});

		it('should update the turn with the provided scored turn', () => {
			const playerAId = generateId();
			addNewCurrentRoundToStore([playerAId, generateId()]);
			const turn = addNewTurnsToStore([playerAId], { tilesPlayed: 1 })[0];

			const roundsLogic = useRoundsLogic();

			const scoredTurn: ScoredTurnInput = {
				tilesDrawn: 1,
				tilesPlayed: 0,
				tileValue: undefined,
				score: 0
			};

			const result = roundsLogic.updateTurn(playerAId, turn.id, scoredTurn);

			expect(result).toEqual({ success: true });
			expect(useTurnsStore().turns.find(t => t.id === turn.id)).toEqual({
				...scoredTurn,
				id: turn.id,
				playerId: playerAId
			});
		});

		it('should update the player stats with the tile delta and score', () => {
			const playerAId = generateId();
			addNewCurrentRoundToStore([playerAId, generateId()]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ currentPlayerId: playerAId });

			const roundsLogic = useRoundsLogic();
			// Initial turn:
			// tilesDrawn=0, tilesPlayed=1 → tile delta: -1, score: 6
			roundsLogic.saveTurn({
				...createPlayedTurn(playerAId, { tilesPlayed: 1, tilesDrawn: 0, tileValue: 6 }),
				score: 6
			});

			// saveTurn generates its own ID; retrieve the stored turn's ID
			const turnId = useTurnsStore().turns[0].id;

			// Update turn:
			// tilesDrawn=2, tilesPlayed=1 → tile delta: +1, score: 4
			// Tile delta change: (+1) - (-1) = +2; score delta: 4 - 6 = -2
			const result = roundsLogic.updateTurn(playerAId, turnId, {
				...createPlayedTurn(playerAId, { tilesPlayed: 1, tilesDrawn: 2, tileValue: 4 }),
				score: 4
			});

			expect(result).toEqual({ success: true });
			const stats = roundsStore.currentRound!.playerStats.find(s => s.id === playerAId)!;

			// Round has 2 players; after saveTurn: tiles = initial - 1;
			// after updateTurn delta (+2): tiles = initial + 1
			const initialTileCount = useRules().determineStonesPerPlayer(2);
			expect(stats.score).toBe(4);
			expect(stats.tiles).toBe(initialTileCount + 1);
		});
	});
});

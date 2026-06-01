import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addNewCurrentRoundToStore, addNewPlayersToStore, addNewTurnsToStore, createPlayedTurn, createPlayer, createSkippedTurn } from '@/test-factories';

import { generateId } from '@/utilities/id';

import { useRoundManager } from './useRoundManager';
import { useRoundsStore } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';
import { usePlayersStore } from '@/stores/players';
import { useRules } from './useRules';

/* ========================================================================== */

vi.mock('@/i18n');

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useRoundManager', () => {
	describe('currentPhase', () => {
		it('should return player-select when there is no current round', () => {
			const { currentPhase } = useRoundManager();

			expect(currentPhase.value).toBe('player-select');
		});

		it('should return the phase of the current round', () => {
			addNewCurrentRoundToStore([generateId(), generateId()], 'turns');

			const { currentPhase } = useRoundManager();

			expect(currentPhase.value).toBe('turns');
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentPlayer', () => {
		it('should return undefined when there is no current round', () => {
			const { currentPlayer } = useRoundManager();

			expect(currentPlayer.value).toBeUndefined();
		});

		it('should return undefined when there is a current round but no player has been set', () => {
			addNewCurrentRoundToStore([generateId()]);

			const { currentPlayer } = useRoundManager();

			expect(currentPlayer.value).toBeUndefined();
		});

		it('should return the current player', () => {
			const playerA = createPlayer('Player A');

			usePlayersStore().addPlayer(playerA);
			addNewCurrentRoundToStore([generateId(), playerA.id]);

			useRoundsStore().updateCurrentRound({ currentPlayerId: playerA.id });

			const { currentPlayer } = useRoundManager();

			expect(currentPlayer.value).toEqual(playerA);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('finishRound', () => {
		it('should return a failure when there is no current round', () => {
			const { finishRound } = useRoundManager();

			expect(finishRound({})).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should return a failure when the round is not blocked and there is no winner', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);

			const { finishRound } = useRoundManager();

			expect(finishRound({})).toEqual({ success: false, message: 'error.noWinner' });
		});

		it('should set the winner to the player with the least leftover points when the round is blocked', () => {
			const [playerAId, playerBId] = [generateId(), generateId()];
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ isBlocked: true });
			const { finishRound } = useRoundManager();

			const result = finishRound({ [playerAId]: 5, [playerBId]: 10 });

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().completedRounds[0].winnerId).toBe(playerAId);
		});

		it('should keep the winner when the round is not blocked', () => {
			const [playerAId, playerBId] = [generateId(), generateId()];
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ winnerId: playerAId });
			const { finishRound } = useRoundManager();

			const result = finishRound({ [playerBId]: 10 });

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().completedRounds[0].winnerId).toBe(playerAId);
		});

		it('should remove all turns for the current round', () => {
			const [playerAId, playerBId] = [generateId(), generateId()];
			addNewCurrentRoundToStore([playerAId, playerBId]);
			addNewTurnsToStore([playerAId, playerBId], { tilesPlayed: 1 });
			useRoundsStore().updateCurrentRound({ winnerId: playerAId });
			const { finishRound } = useRoundManager();

			finishRound({ [playerBId]: 10 });

			expect(useTurnsStore().turns).toHaveLength(0);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('isFirstTurnOfRound', () => {
		it('should return true when there are no turns', () => {
			const { isFirstTurnOfRound } = useRoundManager();

			expect(isFirstTurnOfRound.value).toBe(true);
		});

		it('should return false when there are turns', () => {
			addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });

			const { isFirstTurnOfRound } = useRoundManager();

			expect(isFirstTurnOfRound.value).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('isTurnFirstTurnOfRound', () => {
		it('should return false when there are no turns', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);

			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});

		it('should return true when the turn is the first turn of the round', () => {
			const turns = addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(turns[0].id)).toBe(true);
		});

		it('should return false when the turn is not the first turn of the round', () => {
			const turns = addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(turns[1].id)).toBe(false);
		});

		it('should return false for an unknown turn ID', () => {
			addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('saveTurn', () => {
		it('should return a failure when there is no current round', () => {
			const { saveTurn } = useRoundManager();

			expect(
				saveTurn(createPlayedTurn(generateId()))).toEqual({ success: false, message: 'error.noCurrentRound' }
			);
		});

		it('should return a failure when there is no current player', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);
			const { saveTurn } = useRoundManager();

			expect(
				saveTurn(createPlayedTurn(generateId()))).toEqual({ success: false, message: 'error.noCurrentPlayer' }
			);
		});

		it('should advance to the next player after a normal turn', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId, playerBId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerAId });
			const { saveTurn } = useRoundManager();

			const result = saveTurn(createPlayedTurn(playerAId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.currentPlayerId).toBe(playerBId);
		});

		it('should wrap around to the first player after the last player takes a normal turn', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId, playerBId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerBId });
			const { saveTurn } = useRoundManager();

			const result = saveTurn(createPlayedTurn(playerBId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.currentPlayerId).toBe(playerAId);
		});

		it('should set the phase to round-end with a winner when the current player runs out of tiles', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, players[1].id]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerAId });
			// Bring playerA down to 1 tile so the played turn empties
			// their hand.
			const initialTileCount = useRules().determineStonesPerPlayer(2);
			useRoundsStore().updateCurrentRoundPlayerStats(playerAId, -(initialTileCount - 1), 0);
			const { saveTurn } = useRoundManager();

			const result = saveTurn(createPlayedTurn(playerAId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.phase).toBe('round-end');
			expect(useRoundsStore().currentRound?.winnerId).toBe(playerAId);
		});

		it('should wrap around to the first player after the last player takes a turn', () => {
			const players = addNewPlayersToStore(3);
			const [playerAId, playerBId, playerCId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, playerBId, playerCId]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerCId });
			const { saveTurn } = useRoundManager();

			const result = saveTurn(createPlayedTurn(playerCId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.currentPlayerId).toBe(playerAId);
		});

		it('should mark the round as blocked when all players have consecutively skipped', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId, playerBId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, playerBId]);

			useRoundsStore().updateCurrentRound({ currentPlayerId: playerAId });
			addNewTurnsToStore([playerBId], { tilesPlayed: 0 }); // previous player skipped
			const { saveTurn } = useRoundManager();

			const result = saveTurn(createSkippedTurn(playerAId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.isBlocked).toBe(true);
			expect(useRoundsStore().currentRound?.phase).toBe('round-end');
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('setStartingPlayer', () => {
		it('should return a failure when there is no current round', () => {
			const { setStartingPlayer } = useRoundManager();

			expect(setStartingPlayer(generateId())).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should return a success when there is a current round', () => {
			const playerAId = generateId();
			const { setStartingPlayer } = useRoundManager();
			const roundsStore = useRoundsStore();

			addNewCurrentRoundToStore([generateId(), playerAId]);

			expect(setStartingPlayer(playerAId)).toEqual({ success: true });
			expect(roundsStore.currentRound?.currentPlayerId).toBe(playerAId);
			expect(roundsStore.currentRound?.phase).toEqual('turns');
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('tilesPerPlayer', () => {
		it('should return undefined when there is no current round', () => {
			const { tilesPerPlayer } = useRoundManager();

			expect(tilesPerPlayer.value).toBeUndefined();
		});

		it('should return the tiles per player', () => {
			const playerIds = [generateId(), generateId()];
			addNewCurrentRoundToStore(playerIds);
			const { tilesPerPlayer } = useRoundManager();

			const initialTileCount = useRules().determineStonesPerPlayer(playerIds.length);
			expect(tilesPerPlayer.value).toEqual({
				[playerIds[0]]: initialTileCount,
				[playerIds[1]]: initialTileCount
			});
		});

		it('should reflect updated tile counts after a player plays a tile', () => {
			const playerIds = [generateId(), generateId()];
			addNewCurrentRoundToStore(playerIds);
			const { tilesPerPlayer } = useRoundManager();

			useRoundsStore().updateCurrentRoundPlayerStats(playerIds[0], -1, 0);

			const initialTileCount = useRules().determineStonesPerPlayer(playerIds.length);
			expect(tilesPerPlayer.value).toEqual({
				[playerIds[0]]: initialTileCount - 1,
				[playerIds[1]]: initialTileCount
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updateTurn', () => {
		it('should return a failure when there is no current round', () => {
			const { updateTurn } = useRoundManager();

			const result = updateTurn(generateId(), generateId(), createPlayedTurn(generateId()));
			expect(result).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should return a failure when the turn is not found', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);
			const { updateTurn } = useRoundManager();

			const result = updateTurn(generateId(), generateId(), createPlayedTurn(generateId()));

			expect(result).toEqual({ success: false, message: 'error.turnNotFound' });
		});

		it('should replace the turn in the store', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, players[1].id]);
			const [existingTurn] = addNewTurnsToStore([playerAId], { tilesPlayed: 1 });
			const { updateTurn } = useRoundManager();

			const result = updateTurn(playerAId, existingTurn.id, createSkippedTurn(playerAId, 0));

			expect(result).toEqual({ success: true });
			expect(useTurnsStore().turns[0].tilesPlayed).toBe(0);
		});

		it('should set the phase to round-end with a winner when the updated turn empties the player\'s tiles', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, players[1].id]);
			// Existing skip with tilesDrawn: 0 so the origDelta = 0.
			const [existingTurn] = addNewTurnsToStore([playerAId], { tilesPlayed: 0, tilesDrawn: 0 });
			// Bring playerA down to 1 tile so the updated played turn empties
			// their hand.
			const initialTileCount = useRules().determineStonesPerPlayer(2);
			useRoundsStore().updateCurrentRoundPlayerStats(playerAId, -(initialTileCount - 1), 0);
			const { updateTurn } = useRoundManager();

			// newDelta = 0 - 1 = -1, origDelta = 0,
			// tileDelta = -1 → tiles hit 0.
			const result = updateTurn(playerAId, existingTurn.id, createPlayedTurn(playerAId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.phase).toBe('round-end');
			expect(useRoundsStore().currentRound?.winnerId).toBe(playerAId);
		});

		it('should mark the round as blocked when  updated turn makes all players have consecutively skipped', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId, playerBId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, playerBId]);
			addNewTurnsToStore([playerBId], { tilesPlayed: 0 }); // previous player skipped
			const [playerATurn] = addNewTurnsToStore([playerAId], { tilesPlayed: 1 });
			const { updateTurn } = useRoundManager();

			// Changing playerA's played turn to a skip makes the last 2 turns
			// all skips.
			const result = updateTurn(playerAId, playerATurn.id, createSkippedTurn(playerAId, 0));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.isBlocked).toBe(true);
			expect(useRoundsStore().currentRound?.phase).toBe('round-end');
		});
	});
});

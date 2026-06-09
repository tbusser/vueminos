import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import {
	addNewCurrentRoundToStore,
	addNewGameToStore,
	addNewPlayersToStore,
	addNewTurnsToStore,
	createPlayedTurn,
	createSkippedTurn
} from '@/test-factories';
import { generateId } from '@/utilities/id';

import { useRoundsStore } from '@/stores/rounds';
import {
	useTurnsStore,
	type TurnInput
} from '@/stores/turns';

import { useRules } from './useRules';
import { useRounds } from './useRounds';

/* ========================================================================== */

vi.mock('@/i18n');

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useRounds', () => {
	describe('currentPhase', () => {
		it('should return player-select when there is no current round', () => {
			const { currentPhase } = useRounds();

			expect(currentPhase.value).toBe('player-select');
		});

		it('should return the phase of the current round', () => {
			addNewCurrentRoundToStore([generateId(), generateId()], 'turns');

			const { currentPhase } = useRounds();

			expect(currentPhase.value).toBe('turns');
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentPlayer', () => {
		it('should return undefined when there is no current round', () => {
			const { currentPlayer } = useRounds();

			expect(currentPlayer.value).toBeUndefined();
		});

		it('should return undefined when there is a current round but no player has been set', () => {
			addNewCurrentRoundToStore([generateId()]);

			const { currentPlayer } = useRounds();

			expect(currentPlayer.value).toBeUndefined();
		});

		it('should return the current player', () => {
			const players = addNewPlayersToStore(2);

			addNewCurrentRoundToStore(players.map(p => p.id));
			useRoundsStore().updateCurrentRound({ currentPlayerId: players[0].id });

			const { currentPlayer } = useRounds();

			expect(currentPlayer.value).toEqual(players[0]);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('currentRoundOrdinal', () => {
		/**
		 * currentRoundOrdinal is already tested in the rounds store test suite,
		 * so we only need to test that it is updated correctly when the current
		 * round is finished.
		 */
		it('should reflect the correct ordinal as rounds progress', () => {
			const rounds = useRounds();

			const playerId = generateId();
			addNewCurrentRoundToStore([playerId]);

			expect(rounds.currentRoundOrdinal.value).toEqual(1);

			useRoundsStore().updateCurrentRound({
				phase: 'round-end',
				winnerId: playerId
			});
			rounds.finishCurrentRound({ [playerId]: 0 });

			addNewCurrentRoundToStore([playerId]);
			expect(rounds.currentRoundOrdinal.value).toEqual(2);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('finishCurrentRound', () => {
		it('should return a failure when there is no current round', () => {
			const rounds = useRounds();

			const result = rounds.finishCurrentRound({});

			expect(result).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should return a failure when the round is not blocked and there is no winner', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);

			const { finishCurrentRound } = useRounds();

			expect(finishCurrentRound({})).toEqual({ success: false, message: 'error.noWinner' });
		});

		it('should return a failure when the winner ID is not in the round player stats', () => {
			const rounds = useRounds();

			const playerId = generateId();
			const winnerId = generateId();

			addNewCurrentRoundToStore([playerId]);
			useRoundsStore().updateCurrentRound({ winnerId });

			expect(rounds.finishCurrentRound({ [playerId]: 0 })).toEqual(
				{ success: false, message: 'error.noWinner' }
			);
		});

		it('should return a failure when the round has no winner and is not blocked', () => {
			const rounds = useRounds();

			addNewCurrentRoundToStore([generateId()]);

			expect(rounds.finishCurrentRound({ [generateId()]: 0 })).toEqual(
				{ success: false, message: 'error.noWinner' }
			);
		});

		it('should set the winner to the player with the least leftover points when the round is blocked', () => {
			const [playerAId, playerBId] = [generateId(), generateId()];
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ isBlocked: true });
			const { finishCurrentRound } = useRounds();

			const result = finishCurrentRound({ [playerAId]: 5, [playerBId]: 10 });

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().completedRounds[0].winnerId).toBe(playerAId);
		});

		it('should keep the winner when the round is not blocked', () => {
			const [playerAId, playerBId] = [generateId(), generateId()];
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ winnerId: playerAId });
			const { finishCurrentRound } = useRounds();

			const result = finishCurrentRound({ [playerBId]: 10 });

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().completedRounds[0].winnerId).toBe(playerAId);
		});

		it('should complete the current round and return success when the winner is valid', () => {
			const rounds = useRounds();

			const playerId = generateId();
			const scores = { [playerId]: 100 };
			// Winner gets 25 points for the round.
			const endScores = { [playerId]: 125 };

			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ winnerId: playerId });

			const result = rounds.finishCurrentRound(scores);

			expect(result).toEqual({ success: true });
			expect(roundsStore.currentRound).toBeUndefined();
			expect(roundsStore.completedRounds).toHaveLength(1);
			expect(roundsStore.completedRounds[0]).toMatchObject({ winnerId: playerId, scores: endScores });
		});

		it('should remove all turns for the current round', () => {
			const [playerAId, playerBId] = [generateId(), generateId()];
			addNewCurrentRoundToStore([playerAId, playerBId]);
			addNewTurnsToStore([playerAId, playerBId], { tilesPlayed: 1 });
			useRoundsStore().updateCurrentRound({ winnerId: playerAId });
			const { finishCurrentRound } = useRounds();

			finishCurrentRound({ [playerBId]: 10 });

			expect(useTurnsStore().turns).toHaveLength(0);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('isFirstTurnOfRound', () => {
		it('should return true when there are no turns', () => {
			const { isFirstTurnOfRound } = useRounds();

			expect(isFirstTurnOfRound.value).toBe(true);
		});

		it('should return false when there are turns', () => {
			addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });

			const { isFirstTurnOfRound } = useRounds();

			expect(isFirstTurnOfRound.value).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('isTurnFirstTurnOfRound', () => {
		it('should return false when there are no turns', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);

			const { isTurnFirstTurnOfRound } = useRounds();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});

		it('should return true when the turn is the first turn of the round', () => {
			const turns = addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRounds();

			expect(isTurnFirstTurnOfRound(turns[0].id)).toBe(true);
		});

		it('should return false when the turn is not the first turn of the round', () => {
			const turns = addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRounds();

			expect(isTurnFirstTurnOfRound(turns[1].id)).toBe(false);
		});

		it('should return false for an unknown turn ID', () => {
			addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRounds();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('saveTurn', () => {
		it('should return a failure when there is no current round', () => {
			const { saveTurn } = useRounds();

			expect(
				saveTurn(createPlayedTurn(generateId()))).toEqual({ success: false, message: 'error.noCurrentRound' }
			);
		});

		it('should return a failure when there is no current player', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);
			const turn = createPlayedTurn(generateId());
			const { saveTurn } = useRounds();

			expect(
				saveTurn(turn)).toEqual({ success: false, message: 'error.noCurrentPlayer' }
			);
		});

		it('should return success and add the turn to the turns store with the current player ID', () => {
			const playerId = addNewPlayersToStore(1)[0].id;
			addNewCurrentRoundToStore([playerId]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerId });

			const roundsLogic = useRounds();

			const turn = createPlayedTurn(playerId, { tilesDrawn: 1, tilesPlayed: 1, tileValue: 6 });

			const result = roundsLogic.saveTurn(turn);

			const score = useRules().calculateTurnScore(turn);

			expect(result).toEqual({ success: true });
			expect(useTurnsStore().turns).toHaveLength(1);

			const savedTurn = useTurnsStore().turns[0];
			expect(savedTurn.playerId).toEqual(playerId);
			expect(savedTurn.tilesDrawn).toEqual(turn.tilesDrawn);
			expect(savedTurn.tilesPlayed).toEqual(turn.tilesPlayed);
			expect(savedTurn.tileValue).toEqual(turn.tileValue);
			expect(savedTurn.score).toEqual(score);
		});

		it('should advance to the next player after a normal turn', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId, playerBId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerAId });
			const { saveTurn } = useRounds();

			const result = saveTurn(createPlayedTurn(playerAId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.currentPlayerId).toBe(playerBId);
		});

		it('should wrap around to the first player after the last player takes a normal turn', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId, playerBId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, playerBId]);
			useRoundsStore().updateCurrentRound({ currentPlayerId: playerBId });
			const { saveTurn } = useRounds();

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
			const initialTileCount = useRules().determineTilesPerPlayer(2);
			useRoundsStore().updateCurrentRoundPlayerStats(playerAId, -(initialTileCount - 1), 0);
			const { saveTurn } = useRounds();

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
			const { saveTurn } = useRounds();

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
			const { saveTurn } = useRounds();

			const result = saveTurn(createSkippedTurn(playerAId));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.isBlocked).toBe(true);
			expect(useRoundsStore().currentRound?.phase).toBe('round-end');
		});

		it('should update the current player stats with the tile delta and score', () => {
			const playerId = addNewPlayersToStore(1)[0].id;
			addNewCurrentRoundToStore([playerId]);

			const roundsStore = useRoundsStore();
			roundsStore.updateCurrentRound({ currentPlayerId: playerId });

			const initialTiles = roundsStore.currentRound!.playerStats.find(s => s.id === playerId)!.tiles;

			const roundsLogic = useRounds();

			// tilesDrawn: 2, tilesPlayed: 1 → net tile delta: +1
			const turn: TurnInput = {
				tilesDrawn: 2,
				tilesPlayed: 1,
				tileValue: 6,
				bonusBridge: false,
				bonusDouble: false,
				bonusHexagon: false,
				triple: false
			};
			roundsLogic.saveTurn(turn);

			const score = useRules().calculateTurnScore(turn);

			const updatedStats = roundsStore.currentRound!.playerStats.find(s => s.id === playerId)!;
			expect(updatedStats.score).toBe(score);
			expect(updatedStats.tiles).toBe(initialTiles + 1);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('setStartingPlayer', () => {
		it('should return a failure when there is no current round', () => {
			const { setStartingPlayer } = useRounds();

			expect(
				setStartingPlayer(generateId())).toEqual({ success: false, message: 'error.noCurrentRound' }
			);
		});

		it('should return a failure when the player ID is not in the round player stats', () => {
			addNewCurrentRoundToStore([generateId()]);
			const { setStartingPlayer } = useRounds();

			expect(setStartingPlayer(generateId())).toEqual({ success: false, message: 'error.playerIdNotInRound' });
		});

		it('should return a success when there is a current round', () => {
			const playerAId = generateId();
			const { setStartingPlayer } = useRounds();
			const roundsStore = useRoundsStore();

			addNewCurrentRoundToStore([generateId(), playerAId]);

			expect(setStartingPlayer(playerAId)).toEqual({ success: true });
			expect(roundsStore.currentRound?.currentPlayerId).toBe(playerAId);
			expect(roundsStore.currentRound?.phase).toEqual('turns');
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('startNewRound', () => {
		it('should return a failure when there is no active game', () => {
			const roundsLogic = useRounds();

			const result = roundsLogic.startNewRound();

			expect(result).toEqual({ success: false, message: 'error.noActiveGame' });
		});

		it('should return a failure when there is already a current round', () => {
			addNewGameToStore(100);
			addNewCurrentRoundToStore([generateId()]);
			const roundsLogic = useRounds();

			const result = roundsLogic.startNewRound();

			expect(result).toEqual({ success: false, message: 'error.hasCurrentRound' });
		});

		it('should return success and add a new current round to the rounds store', () => {
			addNewGameToStore(100);
			const roundsLogic = useRounds();

			const result = roundsLogic.startNewRound();

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound).toBeDefined();
		});

		it('should initialize player stats for all active players', () => {
			addNewGameToStore(100);

			const playerIds = addNewPlayersToStore(2).map(p => p.id);

			useRounds().startNewRound();

			const { playerStats } = useRoundsStore().currentRound!;
			const initialTileCount = useRules().determineTilesPerPlayer(playerIds.length);

			expect(playerStats).toHaveLength(playerIds.length);
			playerStats.forEach(stat => {
				expect(playerIds).toContain(stat.id);
				expect(stat.score).toBe(0);
				expect(stat.tiles).toBe(initialTileCount);
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('tilesPerPlayer', () => {
		it('should return undefined when there is no current round', () => {
			const { tilesPerPlayer } = useRounds();

			expect(tilesPerPlayer.value).toBeUndefined();
		});

		it('should return the tiles per player', () => {
			const playerIds = [generateId(), generateId()];
			addNewCurrentRoundToStore(playerIds);
			const { tilesPerPlayer } = useRounds();

			const initialTileCount = useRules().determineTilesPerPlayer(playerIds.length);
			expect(tilesPerPlayer.value).toEqual({
				[playerIds[0]]: initialTileCount,
				[playerIds[1]]: initialTileCount
			});
		});

		it('should reflect updated tile counts after a player plays a tile', () => {
			const playerIds = [generateId(), generateId()];
			addNewCurrentRoundToStore(playerIds);
			const { tilesPerPlayer } = useRounds();

			useRoundsStore().updateCurrentRoundPlayerStats(playerIds[0], -1, 0);

			const initialTileCount = useRules().determineTilesPerPlayer(playerIds.length);
			expect(tilesPerPlayer.value).toEqual({
				[playerIds[0]]: initialTileCount - 1,
				[playerIds[1]]: initialTileCount
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updateTurn', () => {
		it('should return a failure when the turn is not found', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);
			const { updateTurn } = useRounds();

			const result = updateTurn(generateId(), createPlayedTurn(generateId()));

			expect(result).toEqual({ success: false, message: 'error.turnNotFound' });
		});

		it('should return a failure when the round is not in the turns phase', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);
			const { updateTurn } = useRounds();
			useRoundsStore().updateCurrentRound({ phase: 'player-select' });

			const result = updateTurn(generateId(), createPlayedTurn(generateId()));

			expect(result).toEqual({ success: false, message: 'error.notInTurnsPhase' });
		});

		it('should replace the turn in the store', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, players[1].id]);
			const [existingTurn] = addNewTurnsToStore([playerAId], { tilesPlayed: 1 });

			const { updateTurn } = useRounds();
			const turn = createSkippedTurn(playerAId, 0);

			const result = updateTurn(existingTurn.id, turn);

			expect(result).toEqual({ success: true });
			expect(useTurnsStore().turns[0].tilesPlayed).toBe(0);
			expect(useTurnsStore().turns[0].id).toBe(existingTurn.id);
		});

		it('should set the phase to round-end with a winner when the updated turn empties the player\'s tiles', () => {
			const players = addNewPlayersToStore(2);
			const [playerAId] = players.map(p => p.id);
			addNewCurrentRoundToStore([playerAId, players[1].id]);
			// Existing skip with tilesDrawn: 0 so the origDelta = 0.
			const [existingTurn] = addNewTurnsToStore([playerAId], { tilesPlayed: 0, tilesDrawn: 0 });
			// Bring playerA down to 1 tile so the updated played turn empties
			// their hand.
			const initialTileCount = useRules().determineTilesPerPlayer(2);
			useRoundsStore().updateCurrentRoundPlayerStats(playerAId, -(initialTileCount - 1), 0);
			const { updateTurn } = useRounds();

			// newDelta = 0 - 1 = -1, origDelta = 0,
			// tileDelta = -1 → tiles hit 0.
			const result = updateTurn(existingTurn.id, createPlayedTurn(playerAId));

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
			const { updateTurn } = useRounds();

			// Changing playerA's played turn to a skip makes the last 2 turns
			// all skips.
			const result = updateTurn(playerATurn.id, createSkippedTurn(playerAId, 0));

			expect(result).toEqual({ success: true });
			expect(useRoundsStore().currentRound?.isBlocked).toBe(true);
			expect(useRoundsStore().currentRound?.phase).toBe('round-end');
		});
	});
});

import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { PlayerIdNotFoundError } from '@/errors';

import { useGlobalI18n } from '@/i18n';

import { useGameStore } from '@/stores/game';
import { usePlayersStore, type Player } from '@/stores/players';
import {
	useRoundsStore,
	type CurrentRound,
	type PlayerScoreMap,
	type PlayerStats,
	type RoundPhase
} from '@/stores/rounds';
import {
	useTurnsStore,
	type Turn,
	type TurnInput
} from '@/stores/turns';

import type { Feedback } from '@/types/Feedback';

import { generateId } from '@/utilities/id';

import { useRules } from './useRules';
import { useGameScores } from './useGameScores';

/* ========================================================================== */

type ComputeFinalScoresResult = Feedback<{
	isBlocked: boolean;
	scores: PlayerScoreMap;
	winnerId: Id;
}>;

type FinishCurrentRoundPayload = {
	gameOver: boolean;
};

/* ========================================================================== */

/**
 * Represents the number of tiles each player has in their hands in the
 * current round. The keys are player IDs, and the values are the number of
 * tiles each player has in their hands.
 */
export type TilesPerPlayer = Record<Id, number>;

export function useRounds() {
	const gameStore = useGameStore();
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();
	const {
		hasReachedPointsLimit
	} = useGameScores();
	const {
		calculateTurnScore,
		determineRoundWinnerAndPoints,
		determineTilesPerPlayer
	} = useRules();
	const turnsStore = useTurnsStore();
	const { t } = useGlobalI18n();

	const {
		currentRound,
		currentRoundOrdinal
	} = storeToRefs(roundsStore);
	const { turns } = storeToRefs(turnsStore);

	const noCurrentRoundFeedback: Feedback = {
		message: t('error.noCurrentRound'),
		success: false
	};

	/* -- Getters ----------------------------------------------------------- */

	const currentPhase = computed<RoundPhase>(() => {
		return currentRound.value?.phase ?? 'player-select';
	});

	const currentPlayer = computed<Player | undefined>(() => {
		if (currentRound.value === undefined) return undefined;
		if (currentRound.value.currentPlayerId === undefined) return undefined;

		return playersStore.getPlayerById(currentRound.value.currentPlayerId);
	});

	/**
	 * Indicates whether the current turn is the first turn of the round.
	 */
	const isFirstTurnOfRound = computed<boolean>(() => turns.value.length === 0);

	/**
	 * Indicates whether the specified turn is the first turn of the round.
	 * @param turnId The ID of the turn to check.
	 *
	 * @returns True if the turn is the first turn of the round,
	 *          false otherwise.
	 */
	function isTurnFirstTurnOfRound(turnId: Id): boolean {
		if (turns.value.length === 0) return false;

		return turns.value[0].id === turnId;
	}

	const tilesPerPlayer = computed<TilesPerPlayer | undefined>(() => {
		if (currentRound.value === undefined) return undefined;

		return currentRound.value.playerStats.reduce<TilesPerPlayer>((acc, player) => {
			acc[player.id] = player.tiles;
			return acc;
		}, {});
	});

	/* -- Helpers ----------------------------------------------------------- */

	/**
	 * Determines the next player in the round and updates the current player
	 * ID for the current round.
	 */
	function advanceToNextPlayer(): Feedback {
		if (!hasCurrentRound(currentRound.value)) return noCurrentRoundFeedback;
		if (currentPlayer.value === undefined) return { success: false, message: t('error.noCurrentPlayer') };

		const playerIds = currentRound.value.playerStats.map(player => player.id);
		const currentPlayerIndex = playerIds.indexOf(currentPlayer.value.id);

		if (currentPlayerIndex === -1) return { success: false, message: t('error.noCurrentPlayer') };

		const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;

		roundsStore.updateCurrentRound({
			currentPlayerId: playerIds[nextPlayerIndex]
		});

		return { success: true };
	}

	function checkIfPlayerHasNoTiles(playerId: Id): boolean {
		const tileCount = tilesPerPlayer.value?.[playerId];

		return (tileCount === undefined)
			? false
			: tileCount === 0;
	}

	function checkIfRoundIsBlocked(): boolean {
		const playerCount = currentRound.value?.playerStats.length ?? 0;
		const lastTurns = turns.value.slice(-playerCount);

		if (lastTurns.length < playerCount) return false;

		// When all the last turns have no tiles played, the round is blocked.
		return lastTurns.every(turn => turn.tilesPlayed === 0);
	}

	function computeFinalScores(leftoverPoints: PlayerScoreMap): ComputeFinalScoresResult {
		if (!hasCurrentRound(currentRound.value)) return { success: false, message: t('error.noCurrentRound') };

		const isBlocked = currentRound.value.isBlocked ?? false;

		if (!isBlocked && currentRound.value.winnerId === undefined) {
			return {
				message: t('error.noWinner'),
				success: false
			};
		}

		const pointsForWinner = isBlocked
			? determineRoundWinnerAndPoints(leftoverPoints, true)
			: determineRoundWinnerAndPoints(leftoverPoints, false, currentRound.value.winnerId!);

		// Take the scores for each player in the round, add the leftover
		// points to the score of the winner.
		const scores = currentRound.value.playerStats.reduce<PlayerScoreMap>((accumulator, player) => {
			accumulator[player.id] = player.score;
			if (player.id === pointsForWinner.winnerId) accumulator[player.id] += pointsForWinner.points;

			return accumulator;
		}, {});

		return {
			isBlocked,
			scores,
			success: true,
			winnerId: pointsForWinner.winnerId
		} satisfies ComputeFinalScoresResult;
	}

	/**
	 * Checks if the round should transition to round-end and applies the
	 * appropriate state update if so. Returns true when the round ended,
	 * false when it continues.
	 */
	function handleRoundEnd(playerId: Id): boolean {
		if (checkIfRoundIsBlocked()) {
			roundsStore.updateCurrentRound({
				isBlocked: true,
				phase: 'round-end'
			});
			return true;
		}

		if (checkIfPlayerHasNoTiles(playerId)) {
			// The player has no tiles left, so the round ends with this
			// player as the winner.
			roundsStore.updateCurrentRound({
				phase: 'round-end',
				winnerId: playerId
			});
			return true;
		}

		return false;
	}

	function hasCurrentRound(round: CurrentRound | undefined): round is CurrentRound {
		return round !== undefined;
	}

	/**
	 * Initializes player stats for a new round based on the active players.
	 *
	 * @returns An object mapping player IDs to their initial stats,
	 */
	function initializePlayerStats(): PlayerStats[] {
		const stats: PlayerStats[] = [];
		const activePlayers = playersStore.activePlayers;
		const tiles = determineTilesPerPlayer(activePlayers.length);

		for (const player of activePlayers) {
			stats.push({
				id: player.id,
				score: 0,
				tiles
			});
		};

		return stats;
	}

	function insertTurn(turnInput: TurnInput, playerId: Id): Feedback {
		if (!hasCurrentRound(currentRound.value)) return noCurrentRoundFeedback;

		const score = calculateTurnScore(turnInput);
		const turn: Turn = {
			...turnInput,
			id: generateId(),
			playerId,
			score
		};

		// Store the turn in the turns store.
		turnsStore.addTurn(turn);

		try {
			// Update the stats for the current player in the current round.
			roundsStore.updateCurrentRoundPlayerStats(
				playerId,
				turn.tilesDrawn - turn.tilesPlayed,
				turn.score
			);
		} catch (error) {
			return {
				message: (error as Error).message,
				success: false
			};
		}

		return { success: true };
	}

	function replaceTurn(turnId: Id, turn: TurnInput): Feedback<{ playerId: Id }> {
		if (currentRound.value?.phase !== 'turns') {
			return {
				message: t('error.notInTurnsPhase'),
				success: false
			};
		}

		const originalTurn = turnsStore.turns.find(i => i.id === turnId);
		if (originalTurn === undefined) {
			return {
				message: t('error.turnNotFound'),
				success: false
			};
		}

		const score = calculateTurnScore(turn);

		// We've already verified the turn ID is valid, no need to wrap the call
		// in a try/catch for the TurnIdNotFoundError.
		turnsStore.replaceTurn(turnId, {
			...turn,
			id: originalTurn.id,
			playerId: originalTurn.playerId,
			score
		});

		const tileDelta =
			(turn.tilesDrawn - turn.tilesPlayed) -
			(originalTurn.tilesDrawn - originalTurn.tilesPlayed);
		const scoreDelta = score - originalTurn.score;

		try {
			roundsStore.updateCurrentRoundPlayerStats(originalTurn.playerId, tileDelta, scoreDelta);
		} catch (error) {
			return {
				message: (error as PlayerIdNotFoundError).message,
				success: false
			};
		}

		return {
			playerId: originalTurn.playerId,
			success: true
		};
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Finishes the current round by updating the rounds store with the provided
	 * scores and marking the round as completed.
	 *
	 * @param scores A record of scores for each player in the round, where the
	 *        keys are player IDs and the values are their scores.
	 *
	 * @returns In case the round was successfully finished, the returned
	 *          feedback object will contain a game over flag indicating whether
	 *          the game has reached the points limit.
	 */
	function finishCurrentRound(leftOverPoints: PlayerScoreMap): Feedback<FinishCurrentRoundPayload> {
		const result = computeFinalScores(leftOverPoints);
		if (!result.success) return result;

		// When the round is blocked, this is the first opportunity to set the
		// winner of the round.
		if (result.isBlocked) {
			roundsStore.updateCurrentRound({
				winnerId: result.winnerId
			});
		}

		try {
			roundsStore.completeCurrentRound(result.scores);
		} catch (error) {
			// completeCurrentRound can throw an error when there is no current
			// round but the method already ensures there is a current at the
			// beginning. That leaves just the PlayerIdNotFoundError to handle.
			if (error instanceof PlayerIdNotFoundError) {
				return {
					message: t('error.noWinner'),
					success: false
				};
			}

			return {
				message: (error as Error).message,
				success: false
			};
		}

		// Clear the turns for the round which was the current round up to a
		// moment ago. Once it is finished, its turns are no longer editable.
		turnsStore.deleteTurns();

		return {
			gameOver: hasReachedPointsLimit.value,
			success: true
		};
	}

	function saveTurn(turn: TurnInput): Feedback {
		if (!hasCurrentRound(currentRound.value)) return noCurrentRoundFeedback;

		if (currentPlayer.value === undefined) {
			return {
				message: t('error.noCurrentPlayer'),
				success: false
			};
		}

		const saveResult = insertTurn(turn, currentPlayer.value.id);
		if (!saveResult.success) return saveResult;

		if (!handleRoundEnd(currentPlayer.value.id)) {
			return advanceToNextPlayer();
		}

		return { success: true };
	}

	/**
	 * Starts a new round in the current game, initializing player stats
	 * and setting the current player.
	 *
	 * @returns True if the round was successfully started, false otherwise.
	 */
	function startNewRound(): Feedback {
		if (!gameStore.hasActiveGame) {
			return {
				message: t('error.noActiveGame'),
				success: false
			};
		};

		if (hasCurrentRound(currentRound.value)) {
			return {
				message: t('error.hasCurrentRound'),
				success: false
			};
		}

		roundsStore.addRound({
			id: generateId(),
			isCurrentRound: true,
			phase: 'player-select',
			playerStats: initializePlayerStats()
		});

		return { success: true };
	}

	/**
	 * Sets the starting player for the current round. Once the starting player
	 * is set, the round phase is changed to 'turns', indicating that the round
	 * is ready to start taking turns.
	 *
	 * @param playerId The ID of the player to set as the starting player.
	 *
	 * @returns A feedback object indicating success or failure.
	 */
	function setStartingPlayer(playerId: Id): Feedback {
		if (!hasCurrentRound(currentRound.value)) return noCurrentRoundFeedback;

		const isInRound = currentRound.value.playerStats.some(p => p.id === playerId);
		if (!isInRound) return { success: false, message: t('error.playerIdNotInRound') };

		roundsStore.updateCurrentRound({
			currentPlayerId: playerId,
			phase: 'turns'
		});

		return { success: true };
	}

	function updateTurn(turnId: Id, turn: TurnInput): Feedback {
		const replaceResult = replaceTurn(turnId, turn);
		if (!replaceResult.success) return replaceResult;

		handleRoundEnd(replaceResult.playerId);

		return { success: true };
	}

	/* ---------------------------------------------------------------------- */

	return {
		currentPhase,
		currentPlayer,
		currentRoundOrdinal,
		finishCurrentRound,
		isFirstTurnOfRound,
		isTurnFirstTurnOfRound,
		saveTurn,
		setStartingPlayer,
		startNewRound,
		tilesPerPlayer,
		updateTurn
	};
}

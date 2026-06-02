import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { PlayerIdNotFoundError } from '@/errors';

import { useGlobalI18n } from '@/i18n';

import { usePlayersStore } from '@/stores/players';
import { useRoundsStore, type Scores } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';

import { generateId } from '@/utilities/id';

import { useRules } from './useRules';

/* ========================================================================== */

type ComputeFinalScoresResult = Feedback<{
	isBlocked: boolean;
	scores: Scores;
	winnerId: Id;
}>;

type RequireCurrentRoundResult =
	| { success: true; round: CurrentRound }
	| { success: false; message: string };

/* ========================================================================== */

export function useRounds() {
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();
	const { calculateTurnScore, determineRoundWinnerAndPoints } = useRules();
	const turnsStore = useTurnsStore();
	const { t } = useGlobalI18n();

	const {
		currentRound,
		currentRoundOrdinal
	} = storeToRefs(roundsStore);
	const { turns } = storeToRefs(turnsStore);

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
	function advanceToNextPlayer(): void {
		const result = requireCurrentRound();
		if (!result.success) return;
		if (currentPlayer.value === undefined) return;

		const playerIds = result.round.playerStats.map(player => player.id);
		const currentPlayerIndex = playerIds.indexOf(currentPlayer.value.id);

		if (currentPlayerIndex === -1) return;

		const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;

		roundsStore.updateCurrentRound({
			currentPlayerId: playerIds[nextPlayerIndex]
		});
	}

	function checkIfPlayerHasNoTiles(playerId: Id): boolean {
		const tileCount = tilesPerPlayer.value?.[playerId];

		return (tileCount === undefined)
			? false
			: tileCount === 0;
	}

	function checkIfRoundIsBlocked(): boolean {
		const lastTurns = turns.value.slice(-playersStore.activePlayers.length);

		if (lastTurns.length < playersStore.activePlayers.length) return false;

		// When all the last turns have no tiles played, the round is blocked.
		return lastTurns.every(turn => turn.tilesPlayed === 0);
	}

	function computeFinalScores(leftoverPoints: Scores): ComputeFinalScoresResult {
		const result = requireCurrentRound();
		if (!result.success) return result;

		const round = result.round;
		const isBlocked = round.isBlocked ?? false;

		if (!isBlocked && round.winnerId === undefined) {
			return {
				message: t('error.noWinner'),
				success: false
			};
		}

		const pointsForWinner = isBlocked
			? determineRoundWinnerAndPoints(leftoverPoints, true)
			: determineRoundWinnerAndPoints(leftoverPoints, false, round.winnerId!);

		// Take the scores for each player in the round, add the leftover
		// points to the score of the winner.
		const scores = round.playerStats.reduce<Scores>((accumulator, player) => {
			accumulator[player.id] = player.score;
			if (player.id === pointsForWinner.winnerId) accumulator[player.id] += pointsForWinner.points;

			return accumulator;
		}, {});

		return {
			payload: { isBlocked, scores, winnerId: pointsForWinner.winnerId },
			success: true
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

	function insertTurn(turnInput: TurnInput, playerId: Id): Feedback {
		const result = requireCurrentRound();
		if (!result.success) return result;

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
				message: (error as PlayerIdNotFoundError).message,
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
			payload: { playerId: originalTurn.playerId },
			success: true
		};
	}

	function requireCurrentRound(): RequireCurrentRoundResult {
		const round = currentRound.value;

		return round === undefined
			? { success: false, message: t('error.noCurrentRound') }
			: { success: true, round };
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Finishes the current round by updating the rounds store with the provided
	 * scores and marking the round as completed.
	 *
	 * @param scores A record of scores for each player in the round, where the
	 *        keys are player IDs and the values are their scores.
	 *
	 * @returns True if the round was successfully finished, false if there is
	 *          no current round to finish.
	 */
	function finishCurrentRound(leftOverPoints: Scores): Feedback {
		const result = computeFinalScores(leftOverPoints);
		if (!result.success) return result;

		// When the round is blocked, this is the first opportunity to set the
		// winner of the round.
		if (result.payload.isBlocked) {
			roundsStore.updateCurrentRound({
				winnerId: result.payload.winnerId
			});
		}

		try {
			roundsStore.completeCurrentRound(result.payload.scores);
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
		}

		// Clear the turns for the round which was the current round up to a
		// moment ago. Once it is finished, its turns are no longer editable.
		turnsStore.deleteTurns();

		return { success: true };
	}

	function saveTurn(turn: TurnInput): Feedback {
		if (currentPlayer.value === undefined) {
			return {
				message: t('error.noCurrentPlayer'),
				success: false
			};
		}

		const saveResult = insertTurn(turn, currentPlayer.value.id);
		if (!saveResult.success) return saveResult;

		if (!handleRoundEnd(currentPlayer.value.id)) {
			advanceToNextPlayer();
		}

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
		const result = requireCurrentRound();
		if (!result.success) return result;

		roundsStore.updateCurrentRound({
			currentPlayerId: playerId,
			phase: 'turns'
		});

		return { success: true };
	}

	function updateTurn(turnId: Id, turn: TurnInput): Feedback {
		const replaceResult = replaceTurn(turnId, turn);
		if (!replaceResult.success) return replaceResult;

		handleRoundEnd(replaceResult.payload.playerId);

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
		tilesPerPlayer,
		updateTurn
	};
}

import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useGlobalI18n } from '@/i18n';

import { useRoundsLogic } from '@/composables/useRoundsLogic';

import { usePlayersStore } from '@/stores/players';
import { useRoundsStore, type Scores } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';
import { useRules } from '@/composables/useRules';

/* ========================================================================== */

type RequireCurrentRoundResult =
	| { success: true; round: CurrentRound }
	| { success: false; message: string };

/* ========================================================================== */

export function useRoundManager() {
	const playersStore = usePlayersStore();
	const roundsLogic = useRoundsLogic();
	const roundsStore = useRoundsStore();
	const turnsStore = useTurnsStore();

	/* ---------------------------------------------------------------------- */

	const { t } = useGlobalI18n();
	const {
		currentPlayerId,
		currentPlayerStats,
		currentRound
	} = storeToRefs(roundsStore);
	const { calculateTurnScore, determineRoundWinnerAndPoints } = useRules();
	const { turns } = storeToRefs(turnsStore);

	/* ---------------------------------------------------------------------- */

	const currentPlayer = computed<Player | undefined>(() => {
		if (currentRound.value === undefined) return undefined;
		if (currentRound.value.currentPlayerId === undefined) return undefined;

		return playersStore.getPlayerById(currentRound.value.currentPlayerId);
	});

	const currentPhase = computed<RoundPhase>(() => {
		return currentRound.value?.phase ?? 'player-select';
	});

	const tilesPerPlayer = computed<TilesPerPlayer | undefined>(() => {
		if (currentRound.value === undefined) return undefined;

		return currentRound.value.playerStats.reduce((acc, player) => {
			acc[player.id] = player.tiles;
			return acc;
		}, {} as TilesPerPlayer);
	});

	/* ---------------------------------------------------------------------- */

	/**
	 * Indicates whether the current turn is the first turn of the round.
	 */
	const isFirstTurnOfRound = computed<boolean>(() => turns.value.length === 0);

	function isTurnFirstTurnOfRound(turnId: Id): boolean {
		if (turns.value.length === 0) return false;

		return turns.value[0].id === turnId;
	}

	/* ---------------------------------------------------------------------- */

	function requireCurrentRound(): RequireCurrentRoundResult {
		const round = currentRound.value;

		return round === undefined
			? { success: false, message: t('error.noCurrentRound') }
			: { success: true, round };
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Determines the next player in the round and updates the current player
	 * ID for the current round.
	 */
	function advanceToNextPlayer(): void {
		const result = requireCurrentRound();
		if (!result.success) return;
		if (currentPlayerId.value === undefined) return;

		const playerIds = result.round.playerStats.map(player => player.id);
		const currentPlayerIndex = playerIds.indexOf(currentPlayerId.value);

		if (currentPlayerIndex === -1) return;

		const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;

		roundsStore.updateCurrentRound({
			currentPlayerId: playerIds[nextPlayerIndex]
		});
	}

	function checkIfRoundIsBlocked(): boolean {
		const lastTurns = turns.value.slice(-playersStore.activePlayers.length);

		if (lastTurns.length < playersStore.activePlayers.length) return false;

		// When all the last turns have no tiles played, the round is blocked.
		return lastTurns.every(turn => turn.tilesPlayed === 0);
	}

	function checkIfPlayerHasNoTiles(playerId: Id): boolean {
		const playerStats = roundsStore.currentRound?.playerStats.find(player => player.id === playerId);

		if (playerStats === undefined) return false;
		if (playerStats.tiles !== 0) return false;

		return true;
	}

	function checkIfCurrentPlayerHasNoTiles(): boolean {
		if (currentPlayerStats.value === undefined) return false;
		if (currentPlayerStats.value.tiles !== 0) return false;

		return true;
	}

	/* ---------------------------------------------------------------------- */

	function finishRound(leftOverPoints: Scores): Feedback {
		const result = requireCurrentRound();
		if (!result.success) return result;

		const round = result.round;
		const isBlocked = (round.isBlocked ?? false);

		if (!isBlocked && round.winnerId === undefined) {
			return {
				message: t('error.noWinner'),
				success: false
			};
		}

		const pointsForWinner = isBlocked
			? determineRoundWinnerAndPoints(leftOverPoints, true)
			: determineRoundWinnerAndPoints(leftOverPoints, false, round.winnerId!);

		const scores = round.playerStats.reduce((accumulator, player) => {
			accumulator[player.id] = player.score;
			if (player.id === pointsForWinner.winnerId) accumulator[player.id] += pointsForWinner.points;

			return accumulator;
		}, {} as Scores);

		// Update the winner of the current round.
		roundsStore.updateCurrentRound({
			winnerId: pointsForWinner.winnerId
		});

		// Finish the current round.
		roundsLogic.finishCurrentRound(scores);

		// Clear the turns for the round which was the current round up to a
		// moment ago. Once it is finished, its turns are no longer editable.
		turnsStore.deleteTurns();

		return { success: true };
	}

	function saveTurn(turn: TurnInput): Feedback {
		const scoredTurn: ScoredTurnInput = {
			...turn,
			score: calculateTurnScore(turn)
		};
		const saveResult = roundsLogic.saveTurn(scoredTurn);
		if (!saveResult.success) return saveResult;

		if (checkIfRoundIsBlocked()) {
			roundsStore.updateCurrentRound({
				isBlocked: true,
				phase: 'round-end'
			});
		} else if (checkIfCurrentPlayerHasNoTiles()) {
			// The current player has no tiles left, so the round ends. The
			// current player is the winner of the round.
			roundsStore.updateCurrentRound({
				phase: 'round-end',
				winnerId: currentPlayerId.value
			});
		} else {
			advanceToNextPlayer();
		}

		return { success: true };
	}

	function updateTurn(playerId: Id, turnId: Id, turn: TurnInput): Feedback {
		const scoredTurn: ScoredTurnInput = {
			...turn,
			score: calculateTurnScore(turn)
		};

		const updateResult = roundsLogic.updateTurn(playerId, turnId, scoredTurn);
		if (!updateResult.success) return updateResult;

		if (checkIfRoundIsBlocked()) {
			roundsStore.updateCurrentRound({
				isBlocked: true,
				phase: 'round-end'
			});
		} else if (checkIfPlayerHasNoTiles(playerId)) {
			// The current player has no tiles left, so the round ends. The
			// current player is the winner of the round.
			roundsStore.updateCurrentRound({
				phase: 'round-end',
				winnerId: playerId
			});
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

	/* ---------------------------------------------------------------------- */

	return {
		currentPhase,
		currentPlayer,
		finishRound,
		isFirstTurnOfRound,
		isTurnFirstTurnOfRound,
		saveTurn,
		setStartingPlayer,
		tilesPerPlayer,
		updateTurn
	};
}

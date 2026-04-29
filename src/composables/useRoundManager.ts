import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useGlobalI18n } from '@/i18n';

import { useRoundsLogic } from '@/composables/useRoundsLogic';

import { usePlayersStore } from '@/stores/players';
import { useRoundsStore, type Scores } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';
import { useRules } from '@/composables/useRules';

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
	const { determineRoundWinnerAndPoints } = useRules();
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

	/* ---------------------------------------------------------------------- */

	/**
	 * The turns for the current round.
	 */
	const turnsForCurrentRound = computed<Turn[]>(() => {
		const round = currentRound.value;
		if (round === undefined) return [];

		return turns.value.filter(turn => turn.roundId === round.id);
	});

	/**
	 * Indicates whether the current turn is the first turn of the round.
	 */
	const isFirstTurnOfRound = computed<boolean>(() => turnsForCurrentRound.value.length === 0);

	/* ---------------------------------------------------------------------- */

	/**
	 * Determines the next player in the round and updates the current player
	 * ID for the current round.
	 */
	function advanceToNextPlayer(): void {
		if (currentRound.value === undefined) return;
		if (currentPlayerId.value === undefined) return;

		const playerIds = currentRound.value.playerStats.map(player => player.id);
		const currentPlayerIndex = playerIds.indexOf(currentPlayerId.value);

		if (currentPlayerIndex === -1) return;

		const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;

		roundsStore.updateCurrentRound({
			currentPlayerId: playerIds[nextPlayerIndex]
		});
	}

	function checkForBlockedRound(): boolean {
		const lastTurns = turnsForCurrentRound.value.slice(-playersStore.activePlayers.length);
		if (lastTurns.length < playersStore.activePlayers.length) return false;

		const isBlocked = lastTurns.every(turn => turn.tilesPlayed === 0);
		if (!isBlocked) return false;

		roundsStore.updateCurrentRound({
			isBlocked: true,
			phase: 'round-end'
		});

		return true;
	}

	function checkIfCurrentPlayerHasNoTiles(): boolean {
		if (currentPlayerStats.value === undefined) return false;
		if (currentPlayerStats.value.tiles !== 0) return false;

		// The current player has no tiles left, so the round ends. The current
		// player is the winner of the round.
		roundsStore.updateCurrentRound({
			phase: 'round-end',
			winnerId: currentPlayerId.value
		});

		return true;
	}

	/* ---------------------------------------------------------------------- */

	function finishRound(leftOverPoints: Scores): Feedback {
		const round = currentRound.value;
		if (round === undefined) {
			return {
				message: t('errorMessages.noCurrentRound'),
				success: false
			};
		}

		const isBlocked = (round.isBlocked ?? false);

		if (!isBlocked && round.winnerId === undefined) {
			return {
				message: t('errorMessages.noWinner'),
				success: false
			};
		}

		const pointsForWinner = isBlocked
			? determineRoundWinnerAndPoints(leftOverPoints, true)
			: determineRoundWinnerAndPoints(leftOverPoints, false, round.winnerId!);

		const scores = round.playerStats.reduce((result, player) => {
			result[player.id] = player.score;
			if (player.id === pointsForWinner.winnerId) result[player.id] += pointsForWinner.points;

			return result;
		}, {} as Scores);

		// Update the winner of the current round.
		roundsStore.updateCurrentRound({
			winnerId: pointsForWinner.winnerId
		});

		// Finish the current round.
		roundsLogic.finishCurrentRound(scores);

		// Clear the turns for the round which was the current round up to a
		// moment ago. Once it is finished, its turns are no longer editable.
		turnsStore.deleteTurnsForRound(round.id);

		return { success: true };
	}

	function saveTurn(turn: ScoredTurnInput): Feedback {
		const saveResult = roundsLogic.saveTurn(turn);
		if (!saveResult.success) return saveResult;

		if (checkForBlockedRound()) return { success: true };
		if (checkIfCurrentPlayerHasNoTiles()) return { success: true };

		advanceToNextPlayer();

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
		if (!currentRound.value) {
			return {
				message: t('errorMessages.noCurrentRound'),
				success: false
			};
		}

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
		isFirstTurnOfRound,
		finishRound,
		setStartingPlayer,
		saveTurn
	};
}

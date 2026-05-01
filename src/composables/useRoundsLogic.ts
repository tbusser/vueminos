import { storeToRefs } from 'pinia';

import { useGlobalI18n } from '@/i18n';

import { useGameStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/players';
import { useRoundsStore, type Scores } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';

import { generateId } from '@/utilities/id';

import { useRules } from './useRules';

/* ========================================================================== */

export function useRoundsLogic() {
	const gameStore = useGameStore();
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();
	const turnsStore = useTurnsStore();

	/* ---------------------------------------------------------------------- */

	const { activePlayers } = storeToRefs(playersStore);
	const { startingStoneCount } = useRules();
	const { currentPlayerId, currentRound, currentRoundOrdinal, hasCurrentRound } = storeToRefs(roundsStore);
	const { t } = useGlobalI18n();

	/* ---------------------------------------------------------------------- */

	/**
	 * Initializes player stats for a new round based on the active players.
	 *
	 * @returns An object mapping player IDs to their initial stats,
	 */
	function initializePlayerStats(): PlayerStats[] {
		const stats: PlayerStats[] = [];

		for (const player of activePlayers.value) {
			stats.push({
				id: player.id,
				score: 0,
				tiles: startingStoneCount.value
			});
		};

		return stats;
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
	function finishCurrentRound(scores: Scores): Feedback {
		if (!hasCurrentRound.value) {
			return {
				success: false,
				message: t('errorMessages.noCurrentRound')
			};
		}

		roundsStore.completeCurrentRound(scores);

		return { success: true };
	}

	/**
	 * Saves a turn for the current player in the current round.
	 * @param turnInput The input data for the turn, which includes the number
	 *        of tiles drawn, whether a triple was played, and the score.
	 */
	function saveTurn(turnInput: ScoredTurnInput): Feedback {
		if (currentRound.value === undefined) {
			return {
				message: t('errorMessages.noCurrentRound'),
				success: false
			};
		};
		if (currentPlayerId.value === undefined) {
			return {
				message: t('errorMessages.noCurrentPlayer'),
				success: false
			};
		};

		const turn: Turn = {
			...turnInput,
			id: generateId(),
			playerId: currentPlayerId.value,
			roundId: currentRound.value.id
		};

		// Store the turn in the turns store.
		turnsStore.addTurn(turn);

		// Update the stats for the current player in the current round.
		roundsStore.updateCurrentRoundPlayerStats(
			currentPlayerId.value,
			turn.tilesDrawn - turn.tilesPlayed,
			turn.score
		);

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
				message: t('errorMessages.noActiveGame'),
				success: false
			};
		};

		if (hasCurrentRound.value) {
			return {
				message: t('errorMessages.hasCurrentRound'),
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

	/* ---------------------------------------------------------------------- */

	return {
		currentRoundOrdinal,
		finishCurrentRound,
		saveTurn,
		startNewRound
	};
}

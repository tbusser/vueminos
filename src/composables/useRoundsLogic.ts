import { storeToRefs } from 'pinia';

import { useGlobalI18n } from '@/i18n';

import { useGameStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/players';
import { useRoundsStore, type Scores } from '@/stores/rounds';
import { useTurnsStore } from '@/stores/turns';

import { generateId } from '@/utilities/id';

import { useRules } from './useRules';

/* ========================================================================== */

type RequireCurrentRoundResult =
	| { success: true; round: CurrentRound }
	| { success: false; message: string };

/* ========================================================================== */

export function useRoundsLogic() {
	const gameStore = useGameStore();
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();
	const turnsStore = useTurnsStore();

	/* ---------------------------------------------------------------------- */

	const { activePlayers } = storeToRefs(playersStore);
	const { determineStonesPerPlayer } = useRules();
	const { currentPlayerId, currentRound, currentRoundOrdinal, hasCurrentRound } = storeToRefs(roundsStore);
	const { t } = useGlobalI18n();

	/* ---------------------------------------------------------------------- */

	function requireCurrentRound(): RequireCurrentRoundResult {
		const round = currentRound.value;

		return round === undefined
			? { success: false, message: t('error.noCurrentRound') }
			: { success: true, round };
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Initializes player stats for a new round based on the active players.
	 *
	 * @returns An object mapping player IDs to their initial stats,
	 */
	function initializePlayerStats(): PlayerStats[] {
		const stats: PlayerStats[] = [];
		const stoneCount = determineStonesPerPlayer(activePlayers.value.length);

		for (const player of activePlayers.value) {
			stats.push({
				id: player.id,
				score: 0,
				tiles: stoneCount
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
		const result = requireCurrentRound();
		if (!result.success) return result;

		roundsStore.completeCurrentRound(scores);

		return { success: true };
	}

	/**
	 * Saves a turn for the current player in the current round.
	 * @param turnInput The input data for the turn, which includes the number
	 *        of tiles drawn, whether a triple was played, and the score.
	 */
	function saveTurn(turnInput: ScoredTurnInput): Feedback {
		const result = requireCurrentRound();
		if (!result.success) return result;

		if (currentPlayerId.value === undefined) {
			return {
				message: t('error.noCurrentPlayer'),
				success: false
			};
		};

		const turn: Turn = {
			...turnInput,
			id: generateId(),
			playerId: currentPlayerId.value
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

	function updateTurn(playerId: Id, turnId: Id, turn: ScoredTurnInput): Feedback {
		const result = requireCurrentRound();
		if (!result.success) return result;

		const originalTurn = turnsStore.turns.find(i => i.id === turnId);
		if (originalTurn === undefined) {
			return {
				message: t('error.turnNotFound'),
				success: false
			};
		}

		turnsStore.replaceTurn(turnId, {
			...turn,
			id: originalTurn.id,
			playerId: playerId
		});

		const tileDelta =
			(turn.tilesDrawn - turn.tilesPlayed) -
			(originalTurn.tilesDrawn - originalTurn.tilesPlayed);
		const scoreDelta = turn.score - originalTurn.score;

		roundsStore.updateCurrentRoundPlayerStats(playerId, tileDelta, scoreDelta);

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

		if (hasCurrentRound.value) {
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

	/* ---------------------------------------------------------------------- */

	return {
		currentRoundOrdinal,
		finishCurrentRound,
		saveTurn,
		startNewRound,
		updateTurn
	};
}

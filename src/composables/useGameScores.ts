import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useGameStore } from '@/stores/game';
import { useRoundsStore } from '@/stores/rounds';
import { usePlayersStore } from '@/stores/players';

/* ========================================================================== */

export function useGameScores() {
	const gameStore = useGameStore();
	const roundsStore = useRoundsStore();
	const playersStore = usePlayersStore();

	const { pointsLimit } = storeToRefs(gameStore);
	const { currentRound, completedRounds } = storeToRefs(roundsStore);

	/* -- Score Aggregation ------------------------------------------------- */

	const currentRoundScore = computed<ScorePerPlayer>(() => {
		if (currentRound.value === undefined) return {};

		return currentRound.value.playerStats.reduce((acc, playerStat) => {
			acc[playerStat.id] = playerStat.score;
			return acc;
		}, {} as ScorePerPlayer);
	});

	const finishedRoundsScore = computed<ScorePerPlayer>(() => {
		return completedRounds.value.reduce((acc, round) => {
			(Object.keys(round.scores) as Id[]).forEach((playerId) => {
				acc[playerId] = (acc[playerId] ?? 0) + round.scores[playerId];
			});

			return acc;
		}, {} as ScorePerPlayer);
	});

	const totalScore = computed<ScorePerPlayer>(() => {
		const keys = new Set<Id>([
			...Object.keys(currentRoundScore.value) as Id[],
			...Object.keys(finishedRoundsScore.value) as Id[]
		]);

		const result: ScorePerPlayer = {};
		keys.forEach((key) => {
			result[key] =
				(currentRoundScore.value[key] ?? 0) + (finishedRoundsScore.value[key] ?? 0);
		});

		return result;
	});

	/* -- Game State -------------------------------------------------------- */

	const hasReachedPointsLimit = computed<boolean>(() => {
		const scores = Object.values(totalScore.value);

		return Math.max(...scores) >= pointsLimit.value;
	});

	const winningPlayerId = computed<Id | undefined>(() => {
		if (!hasReachedPointsLimit.value) return undefined;

		const [winner, ...players] = Object.entries(totalScore.value) as [Id, number][];

		return players.reduce((winner, player) =>
			player[1] > winner[1] ? player : winner
		, winner)[0];
	});

	const winner = computed<Player | undefined>(() => {
		if (winningPlayerId.value === undefined) return undefined;

		return playersStore.getPlayerById(winningPlayerId.value);
	});

	/* ---------------------------------------------------------------------- */

	return {
		/**
		 * Indicates whether the points limit for the game has been reached.
		 */
		hasReachedPointsLimit,

		/**
		 * The points scored, per player, over the completed and current rounds.
		 */
		totalScore,

		/**
		 * The player who has won the game. Is undefined as long as the points
		 * limit has not been reached or the winner is not found in the
		 * players store.
		 */
		winner
	};
}

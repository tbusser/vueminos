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

	/* ---------------------------------------------------------------------- */

	const { pointsLimit } = storeToRefs(gameStore);
	const { playerScores } = storeToRefs(roundsStore);

	const hasReachedPointsLimit = computed<boolean>(() => {
		const scores = Object.values(playerScores.value);

		return Math.max(...scores) >= pointsLimit.value;
	});

	/* ---------------------------------------------------------------------- */

	const winningPlayerId = computed<Id | undefined>(() => {
		if (!hasReachedPointsLimit.value) return undefined;

		const [winner, ...players] = Object.entries(playerScores.value) as [Id, number][];

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
		 * Indicates whether the points limit has been reached.
		 */
		hasReachedPointsLimit,

		/**
		 * The points scored, per player, over the completed and current rounds.
		 */
		totalScore: playerScores,

		/**
		 * The player who has won the game.
		 */
		winner
	};
}

import { computed, readonly, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayersStore } from '@/stores/players';
import { useRoundsStore } from '@/stores/rounds';

/* ========================================================================== */

export type CollectedPoints = {
	[id: Id]: number | undefined;
};

/* ========================================================================== */

export function useCollectPoints() {
	const playersStore = usePlayersStore();

	const { activePlayers } = storeToRefs(playersStore);
	const { currentRound } = storeToRefs(useRoundsStore());

	/* ---------------------------------------------------------------------- */

	/**
	 * During the round-end phase a player can no longer go from active to
	 * inactive. For this reason it is fine to use a ref to store the points per
	 * player.
	 */
	const collectedPoints = ref<CollectedPoints>(
		activePlayers.value.reduce((acc, player) => {
			// The player who has won the round does not need to collect points.
			if (player.id === currentRound.value?.winnerId) return acc;

			return {
				...acc,
				[player.id]: undefined
			};
		}, {})
	);

	const isComplete = computed<boolean>(() => areCollectedPointsComplete(collectedPoints.value));

	const winningPlayerName = computed<string | undefined>(() => {
		if (currentRound.value?.winnerId === undefined) return undefined;

		const player = playersStore.getPlayerById(currentRound.value.winnerId);

		return player?.name;
	});

	/* ---------------------------------------------------------------------- */

	function areCollectedPointsComplete(points: CollectedPoints): points is LeftoverPoints {
		const values = Object.values(points);

		return (values.length === 0)
			? false
			: values.every(p => p !== undefined);
	}

	function hasPlayerWonTheRound(playerId: Id): boolean {
		return currentRound.value?.winnerId === playerId;
	}

	function setCollectedPoints(playerId: Id, points: number | undefined): void {
		if (!Object.hasOwn(collectedPoints.value, playerId)) return;

		collectedPoints.value[playerId] = points;
	}

	/* ---------------------------------------------------------------------- */

	return {
		activePlayers,

		areCollectedPointsComplete,

		/**
		 * The collected points for each player in the current round. The value
		 * is undefined as long as the player has not collected points. Do not
		 * modify the object directly, use the `setCollectedPoints`
		 * function instead.
		 */
		collectedPoints: readonly(collectedPoints),

		hasPlayerWonTheRound,

		isComplete,

		/**
		 * Sets the collected points for a player in the current round.
		 * @param points - The number of points to set for the player. If the
		 *        value is undefined, the points will be cleared for the player.
		 */
		setCollectedPoints,

		winningPlayerName
	};
}

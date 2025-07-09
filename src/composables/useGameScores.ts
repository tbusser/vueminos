import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useGameStore } from '@/stores/game';
import { useRoundsStore } from '@/stores/rounds';

/* ========================================================================== */

export function useGameScores() {
	const gameStore = useGameStore();
	const roundsStore = useRoundsStore();

	/* ---------------------------------------------------------------------- */

	const { id, pointsLimit } = storeToRefs(gameStore);
	const { roundsForGame, currentRound } = storeToRefs(roundsStore);

	const currentRoundScore = ref<Record<Id, number>>({});
	const finishedRoundsScore = ref<Record<Id, number>>({});

	const totalScore = computed<Record<Id, number>>(() => {
		const keys = new Set<Id>([
			...Object.keys(currentRoundScore.value) as Id[], ...Object.keys(finishedRoundsScore.value) as Id[]
		]);

		const result: Record<Id, number> = {};
		keys.forEach((key) => {
			result[key] = (currentRoundScore.value[key] ?? 0) + (finishedRoundsScore.value[key] ?? 0);
		});

		return result;
	});

	/* ---------------------------------------------------------------------- */

	watch(() => currentRound.value?.playerStats, playerStats => {
		if (playerStats === undefined) return {};

		currentRoundScore.value = playerStats?.reduce((acc,playerStat) => {
			return {
				...acc,
				[playerStat.id]: playerStat.score
			};
		}, {} as Record<Id, number>);
	}, {
		immediate: true
	});

	watch(roundsForGame, (rounds) => {
		finishedRoundsScore.value = rounds.reduce((acc, round) => {
			if (round.isCurrentRound === true) return acc;

			(Object.keys(round.scores) as Id[]).forEach((playerId) => {
				acc[playerId] = (acc[playerId] ?? 0) + round.scores[playerId];
			});

			return acc;
		}, {} as Record<Id, number>);
	}, {
		immediate: true
	});

	/* ---------------------------------------------------------------------- */

	return {
		totalScore
	};
}

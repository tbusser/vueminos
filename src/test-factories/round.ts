import { useRules } from '@/composables/useRules';

import { useRoundsStore, type Scores } from '@/stores/rounds';

import { generateId } from '@/utilities/id';

import { assertActivePinia } from './assertActivePinia';

/* ========================================================================== */

function createCurrentRound(playerIds: Id[], phase: RoundPhase = 'turns', winnerId?: Id): CurrentRound {
	const tileCount = useRules().determineStonesPerPlayer(playerIds.length);

	return {
		id: generateId(),
		isCurrentRound: true,
		phase,
		playerStats: playerIds.map(id => ({ id, score: 0, tiles: tileCount })),
		winnerId
	} satisfies CurrentRound;
}

function createCompletedRound(winnerId: Id, scores: Scores): CompletedRound {
	return {
		id: generateId(),
		isCurrentRound: false,
		scores,
		winnerId
	} satisfies CompletedRound;
}

function addNewCurrentRoundToStore(playerIds: Id[], phase?: RoundPhase): Round {
	assertActivePinia('addNewCurrentRoundToStore');

	const round = createCurrentRound(playerIds, phase);
	useRoundsStore().addRound(round);

	return round;
}

/* ========================================================================== */

export {
	addNewCurrentRoundToStore,
	createCompletedRound,
	createCurrentRound
};

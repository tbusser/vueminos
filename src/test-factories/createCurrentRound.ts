import { generateId } from '@/utilities/id';

/* ========================================================================== */

export function createCurrentRound(playerIds: Id[] = []): CurrentRound {
	return {
		id: generateId(),
		isCurrentRound: true,
		phase: 'player-select',
		playerStats: playerIds.map(id => ({ id, score: 0, tiles: 0 }))
	} satisfies CurrentRound;
}

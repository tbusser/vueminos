import { generateId } from '@/utilities/id';

/* ========================================================================== */

export function createTurn(): Turn {
	return {
		id: generateId(),
		playerId: generateId(),
		score: 0,
		tilesDrawn: 3,
		tilesPlayed: 0,
		tileValue: undefined
	} satisfies Turn;
}

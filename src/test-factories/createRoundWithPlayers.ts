import { usePlayersStore } from '@/stores/players';
import { useTurnsStore } from '@/stores/turns';

import { generateId } from '@/utilities/id';

import { assertActivePinia } from './assertActivePinia';
import { createCurrentRound } from './createCurrentRound';

/* ========================================================================== */

export function createRoundWithPlayers(ids: Id[], turns: number): Id[] {
	assertActivePinia('createRoundWithPlayers');

	const playersStore = usePlayersStore();
	ids.forEach(id => {
		playersStore.addPlayer({ active: true, id, name: id });
	});

	createCurrentRound(ids);

	const turnStore = useTurnsStore();
	return new Array(turns).fill(0).map((_, index) => {
		const id = generateId();

		turnStore.addTurn({
			bonusBridge: false,
			bonusDouble: false,
			bonusHexagon: false,
			triple: false,
			id,
			playerId: ids[index % ids.length],
			score: 0,
			tilesDrawn: 0,
			tilesPlayed: 1,
			tileValue: 6
		} satisfies Turn);

		return id;
	});
}

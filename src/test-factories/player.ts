import { usePlayersStore } from '@/stores/players';

import { generateId } from '@/utilities/id';

import { assertActivePinia } from './assertActivePinia';

/* ========================================================================== */

function createPlayer(name: string, id: Id = generateId()): Player {
	return {
		active: true,
		id,
		name
	} satisfies Player;
}

function addNewPlayersToStore(count: number): Player[] {
	assertActivePinia('addNewPlayersToStore');

	const playersStore = usePlayersStore();
	const players: Player[] = [];

	for (let i = 0; i < count; i++) {
		const player = createPlayer(`Player ${i + 1}`);
		playersStore.addPlayer(player);
		players.push(player);
	}

	return players;
}

/* ========================================================================== */

export {
	addNewPlayersToStore,
	createPlayer
};

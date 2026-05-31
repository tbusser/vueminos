import { useGameStore } from '@/stores/game';
import { assertActivePinia } from './assertActivePinia';

/* ========================================================================== */

function addNewGameToStore(limit: number): void {
	assertActivePinia('addNewGameToStore');

	useGameStore().createNewGame(limit);
}

/* ========================================================================== */

export {
	addNewGameToStore
};

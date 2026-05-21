import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { TurnIdNotFoundError } from '@/errors';

import { addNewTurnsToStore, createSkippedTurn } from '@/test-factories';

import { generateId } from '@/utilities/id';

import { useTurnsStore } from './turns';

/* ========================================================================== */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Turns Store', () => {
	describe('addTurn', () => {
		it('should add a turn to the store', () => {
			const turnStore = useTurnsStore();
			const turn = createSkippedTurn(generateId());

			turnStore.addTurn(turn);

			expect(turnStore.turns).toHaveLength(1);
			expect(turnStore.turns[0]).toEqual(turn);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('deleteTurns', () => {
		it('should delete all turns', () => {
			const turnStore = useTurnsStore();

			turnStore.addTurn(createSkippedTurn(generateId()));
			turnStore.addTurn(createSkippedTurn(generateId()));

			turnStore.deleteTurns();

			expect(turnStore.turns).toHaveLength(0);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updateTurn', () => {
		it('should update the turn with the specified ID with the new values', () => {
			const [turnA, turnB] = addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const turnStore = useTurnsStore();

			turnStore.updateTurn(turnA.id, { score: 10 });

			expect(turnStore.turns[0]).toEqual({ ...turnA, score: 10 });
			expect(turnStore.turns[1]).toEqual(turnB);
		});

		it('should throw an error if the turn with the specified ID is not found', () => {
			const turnStore = useTurnsStore();

			expect(() => turnStore.updateTurn(generateId(), { score: 10 })).toThrow(TurnIdNotFoundError);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('$reset', () => {
		it('should reset the turns store', () => {
			addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const turnStore = useTurnsStore();

			turnStore.$reset();

			expect(turnStore.turns).toHaveLength(0);
		});
	});
});

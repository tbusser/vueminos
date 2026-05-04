import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { TurnIdNotFoundError } from '@/errors';

import { generateId } from '@/utilities/id';

import { useTurnsStore } from './turns';

/* ========================================================================== */

function createTurn(roundId = generateId()): Turn {
	return {
		id: generateId(),
		playerId: generateId(),
		roundId,
		score: 0,
		tilesDrawn: 3,
		tilesPlayed: 0,
		tileValue: undefined
	} satisfies Turn;
}

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Turns Store', () => {
	describe('addTurn', () => {
		it('should add a turn to the store', () => {
			const turnStore = useTurnsStore();
			const turn = createTurn();

			turnStore.addTurn(turn);

			expect(turnStore.turns).toHaveLength(1);
			expect(turnStore.turns[0]).toEqual(turn);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('deleteTurnsForRound', () => {
		it('should delete turns for a specific round', () => {
			const turnStore = useTurnsStore();

			const roundA = generateId();
			const turnA = createTurn(roundA);

			const roundB = generateId();
			const turnB = createTurn(roundB);

			turnStore.addTurn(turnA);
			turnStore.addTurn(turnB);

			turnStore.deleteTurnsForRound(roundA);

			expect(turnStore.turns).toHaveLength(1);
			expect(turnStore.turns[0]).toEqual(turnB);
		});

		it('should do nothing if the round ID is not found', () => {
			const turnStore = useTurnsStore();
			const turn = createTurn();

			turnStore.addTurn(turn);

			turnStore.deleteTurnsForRound(generateId());

			expect(turnStore.turns).toHaveLength(1);
			expect(turnStore.turns[0]).toEqual(turn);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updateTurn', () => {
		it('should update the turn with the specified ID with the new values', () => {
			const turnStore = useTurnsStore();
			const turnA = createTurn();
			const turnB = createTurn();

			turnStore.addTurn(turnA);
			turnStore.addTurn(turnB);

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
			const turnStore = useTurnsStore();
			const turnA = createTurn();
			const turnB = createTurn();

			turnStore.addTurn(turnA);
			turnStore.addTurn(turnB);

			turnStore.$reset();

			expect(turnStore.turns).toHaveLength(0);
		});
	});
});

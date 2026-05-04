import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useGameStore } from './game';

/* ========================================================================== */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Game Store', () => {
	describe('createNewGame', () => {
		it('should create a new game with the specified points limit', () => {
			const gameStore = useGameStore();
			// Subtract 1 second to ensure the timestamp is in the past.
			const beforeCreationTimestamp = Date.now() - 1000;
			gameStore.createNewGame(100);

			expect(gameStore.pointsLimit).toBe(100);
			expect(gameStore.hasActiveGame).toBe(true);
			expect(gameStore.startTimestamp).toBeGreaterThan(beforeCreationTimestamp);
		});

		it('should overwrite an existing game when a new game is created', () => {
			const gameStore = useGameStore();
			gameStore.createNewGame(100);
			gameStore.createNewGame(200);

			expect(gameStore.pointsLimit).toBe(200);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('$reset', () => {
		it('should reset the game store', () => {
			const gameStore = useGameStore();
			gameStore.createNewGame(100);
			gameStore.$reset();

			expect(gameStore.pointsLimit).toBe(0);
			expect(gameStore.hasActiveGame).toBe(false);
			expect(gameStore.startTimestamp).toBeUndefined();
		});
	});
});

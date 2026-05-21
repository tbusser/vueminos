import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { createCurrentRound, createPlayedTurn } from '@/test-factories';

import { generateId } from '@/utilities/id';

import { useTurnsStore } from '@/stores/turns';
import { useGameStore } from '@/stores/game';
import { useRoundsStore } from '@/stores/rounds';

import { useGameLogic } from './useGameLogic';

/* ========================================================================== */

vi.mock('@/i18n');

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useGameLogic', () => {
	describe('isValidLimit', () => {
		it('should return false when the limit is not a number', () => {
			const { isValidLimit } = useGameLogic();
			expect(isValidLimit('100')).toBe(false);
		});

		it('should return false when the limit is not finite', () => {
			const { isValidLimit } = useGameLogic();
			expect(isValidLimit(Infinity)).toBe(false);
			expect(isValidLimit(-Infinity)).toBe(false);
		});

		it('should return false when the limit is negative', () => {
			const { isValidLimit } = useGameLogic();
			expect(isValidLimit(-10)).toBe(false);
		});

		it('should return false when the limit is zero', () => {
			const { isValidLimit } = useGameLogic();
			expect(isValidLimit(0)).toBe(false);
		});

		it('should return true when the limit is positive', () => {
			const { isValidLimit } = useGameLogic();
			expect(isValidLimit(100)).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('resetGameProgress', () => {
		it('should reset game progress stores', () => {
			useGameStore().createNewGame(100);
			useTurnsStore().addTurn(createPlayedTurn(generateId()));
			createCurrentRound([generateId()]);

			const { resetGameProgress } = useGameLogic();
			resetGameProgress();

			expect(useGameStore().hasActiveGame).toBe(false);
			expect(useRoundsStore().rounds).toHaveLength(0);
			expect(useTurnsStore().turns).toHaveLength(0);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('startNewGame', () => {
		it('should return a failure when the limit is invalid', () => {
			const { startNewGame } = useGameLogic();
			const result = startNewGame(0);

			expect(result.success).toBe(false);
			expect(useGameStore().hasActiveGame).toBe(false);
		});

		it('should return a success when the limit is valid', () => {
			const { startNewGame } = useGameLogic();
			const result = startNewGame(100);

			expect(result.success).toBe(true);
			expect(useGameStore().hasActiveGame).toBe(true);
		});
	});
});

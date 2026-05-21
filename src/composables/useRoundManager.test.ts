import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addNewCurrentRoundToStore, addNewTurnsToStore } from '@/test-factories';

import { generateId } from '@/utilities/id';

import { useRoundManager } from './useRoundManager';

/* ========================================================================== */

vi.mock('@/i18n');

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useRoundManager', () => {
	describe('isTurnFirstTurnOfRound', () => {
		it('should return false when there are no turns', () => {
			addNewCurrentRoundToStore([generateId(), generateId()]);

			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});

		it('should return true when the turn is the first turn of the round', () => {
			const turns = addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(turns[0].id)).toBe(true);
		});

		it('should return false when the turn is not the first turn of the round', () => {
			const turns = addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(turns[1].id)).toBe(false);
		});

		it('should return false for an unknown turn ID', () => {
			addNewTurnsToStore([generateId(), generateId()], { tilesPlayed: 1 });
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});
	});
});

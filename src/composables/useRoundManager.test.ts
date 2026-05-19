import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { createCurrentRound, createMockGlobalI18n, createRoundWithPlayers } from '@/test-factories';

import { useRoundManager } from './useRoundManager';
import { generateId } from '@/utilities/id';

/* ========================================================================== */

createMockGlobalI18n();

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useRoundManager', () => {
	describe('isTurnFirstTurnOfRound', () => {
		it('should return false when there are no turns', () => {
			createCurrentRound([generateId(), generateId()]);
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});

		it('should return true when the turn is the first turn of the round', () => {
			const roundTurnIds = createRoundWithPlayers([generateId(), generateId()], 2);
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(roundTurnIds[0])).toBe(true);
		});

		it('should return false when the turn is not the first turn of the round', () => {
			const roundTurnIds = createRoundWithPlayers([generateId(), generateId()], 2);
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(roundTurnIds[1])).toBe(false);
		});

		it('should return false for an unknown turn ID', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);
			const { isTurnFirstTurnOfRound } = useRoundManager();

			expect(isTurnFirstTurnOfRound(generateId())).toBe(false);
		});
	});
});

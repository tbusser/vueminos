import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRoundsLogic } from './useRoundsLogic';
import { generateId } from '@/utilities/id';
import { createPinia, setActivePinia } from 'pinia';
import { useTurnsStore } from '@/stores/turns';
import { addNewCurrentRoundToStore, addNewTurnsToStore } from '@/test-factories';

/* ========================================================================== */

vi.mock('@/i18n');

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useRoundsLogic', () => {
	describe('updateTurn', () => {
		it('should throw an error when there is no current round', () => {
			const roundsLogic = useRoundsLogic();

			const scoredTurn: ScoredTurnInput = {
				tilesDrawn: 1,
				tilesPlayed: 0,
				tileValue: undefined,
				score: 0
			};

			const result = roundsLogic.updateTurn(generateId(), generateId(), scoredTurn);

			expect(result).toEqual({ success: false, message: 'error.noCurrentRound' });
		});

		it('should update the turn with the provided scored turn', () => {
			const playerAId = generateId();
			addNewCurrentRoundToStore([playerAId, generateId()]);
			const turn = addNewTurnsToStore([playerAId], { tilesPlayed: 1 })[0];

			const roundsLogic = useRoundsLogic();

			const scoredTurn: ScoredTurnInput = {
				tilesDrawn: 1,
				tilesPlayed: 0,
				tileValue: undefined,
				score: 0
			};

			const result = roundsLogic.updateTurn(playerAId, turn.id, scoredTurn);

			expect(result).toEqual({ success: true });
			expect(useTurnsStore().turns.find(t => t.id === turn.id)).toEqual({
				...scoredTurn,
				id: turn.id,
				playerId: playerAId
			});
		});
	});
});

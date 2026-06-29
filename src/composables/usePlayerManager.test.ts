import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateId } from '@/utilities/id';
import { maximumNumberOfPlayers, minimumNumberOfPlayers } from '@/utilities/rules';

import { assertSuccessfulFeedback } from '@/test-factories/assertSuccessfulFeedback';

import { usePlayerManager } from './usePlayerManager';

/* ========================================================================== */

function addPlayers(playerManager: ReturnType<typeof usePlayerManager>, count: number): void {
	for (let i = 0; i < count; i++) {
		playerManager.addNewPlayer(`Player ${i + 1}`);
	}
}

/* -------------------------------------------------------------------------- */

vi.mock('@/i18n');

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('usePlayerManager', () => {
	describe('addNewPlayer', () => {
		it('should return a feedback object with a false success property if the name is not a valid name', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.addNewPlayer('')).toEqual({ success: false, message: 'error.invalidName' });
			expect(playerManager.addNewPlayer('   ')).toEqual({ success: false, message: 'error.invalidName' });

			expect(playerManager.players.value).toHaveLength(0);
		});

		it('should add a new player with the specified name', () => {
			const playerManager = usePlayerManager();

			const name = 'John Doe';
			const result = playerManager.addNewPlayer(name);

			expect(result.success).toBe(true);

			const id = result.success && result.id;
			expect(id).toBeTypeOf('string');

			expect(playerManager.players.value).toHaveLength(1);
			expect(playerManager.players.value[0]).toEqual({
				active: true,
				id,
				name
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('deletePlayer', () => {
		it('should do nothing if the player with the specified ID is not found', () => {
			const playerManager = usePlayerManager();
			const id = assertSuccessfulFeedback(playerManager.addNewPlayer('John Doe'), 'id');

			playerManager.deletePlayer(generateId());

			expect(playerManager.players.value).toHaveLength(1);
			expect(playerManager.players.value[0]).toEqual({
				active: true,
				id,
				name: 'John Doe'
			});
		});

		it('should only delete the player with the specified ID', () => {
			const playerManager = usePlayerManager();
			const idJohn = assertSuccessfulFeedback(playerManager.addNewPlayer('John Doe'), 'id');
			const idJane = assertSuccessfulFeedback(playerManager.addNewPlayer('Jane Doe'), 'id');

			playerManager.deletePlayer(idJohn);

			expect(playerManager.players.value).toHaveLength(1);
			expect(playerManager.players.value[0].id).toBe(idJane);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasExceededMaximum', () => {
		it('should return false when there are no players', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.hasExceededMaximum.value).toBe(false);
		});

		it('should return false when the number of players is less than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, 2);

			expect(playerManager.hasExceededMaximum.value).toBe(false);
		});

		it('should return false when the number of players is equal to the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, maximumNumberOfPlayers);

			expect(playerManager.hasExceededMaximum.value).toBe(false);
		});

		it('should return true when the number of players is greater than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, maximumNumberOfPlayers + 1);

			expect(playerManager.hasExceededMaximum.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasPlayers', () => {
		it('should return false when there are no players', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.hasPlayers.value).toBe(false);
		});

		it('should return true when there are players', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, 1);

			expect(playerManager.hasPlayers.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasReachedMaximum', () => {
		it('should return false when there are no players', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.hasReachedMaximum.value).toBe(false);
		});

		it('should return false when the number of players is less than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, maximumNumberOfPlayers - 1);

			expect(playerManager.hasReachedMaximum.value).toBe(false);
		});

		it('should return true when the number of players is equal to the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, maximumNumberOfPlayers);

			expect(playerManager.hasReachedMaximum.value).toBe(true);
		});

		it('should return true when the number of players is greater than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, maximumNumberOfPlayers + 1);

			expect(playerManager.hasReachedMaximum.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasReachedMinimum', () => {
		it('should return false when there are no players', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.hasReachedMinimum.value).toBe(false);
		});

		it('should return false when the number of players is less than the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, minimumNumberOfPlayers - 1);

			expect(playerManager.hasReachedMinimum.value).toBe(false);
		});

		it('should return true when the number of players is equal to the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, minimumNumberOfPlayers);

			expect(playerManager.hasReachedMinimum.value).toBe(true);
		});

		it('should return true when the number of players is greater than the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, minimumNumberOfPlayers + 1);

			expect(playerManager.hasReachedMinimum.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasValidNumberOfActivePlayers', () => {
		it('should return false when there are no players', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(false);
		});

		it('should return false when the number of players is less than the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, minimumNumberOfPlayers - 1);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(false);
		});

		it('should return true when the number of players is equal to the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, minimumNumberOfPlayers);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(true);
		});

		it('should return true when the number of players is greater than the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, minimumNumberOfPlayers + 1);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(true);
		});

		it('should return true when the number of players is equal to the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, maximumNumberOfPlayers);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(true);
		});

		it('should return false when the number of players is greater than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, maximumNumberOfPlayers + 1);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('players', () => {
		it('should return an empty array when there are no players', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.players.value).toHaveLength(0);
		});

		it('should return the list of players', () => {
			const playerManager = usePlayerManager();

			const idJohn = assertSuccessfulFeedback(playerManager.addNewPlayer('John Doe'), 'id');
			const idJane = assertSuccessfulFeedback(playerManager.addNewPlayer('Jane Doe'), 'id');
			const idJim = assertSuccessfulFeedback(playerManager.addNewPlayer('Jim Doe'), 'id');

			expect(playerManager.players.value).toHaveLength(3);
			expect(playerManager.players.value[0]).toEqual({
				active: true,
				id: idJohn,
				name: 'John Doe'
			});
			expect(playerManager.players.value[1]).toEqual({
				active: true,
				id: idJane,
				name: 'Jane Doe'
			});
			expect(playerManager.players.value[2]).toEqual({
				active: true,
				id: idJim,
				name: 'Jim Doe'
			});
		});

		it('should reflect the current state after a player is deleted', () => {
			const playerManager = usePlayerManager();
			addPlayers(playerManager, 3);

			const idToDelete = playerManager.players.value[0].id;
			playerManager.deletePlayer(idToDelete);

			expect(playerManager.players.value).toHaveLength(2);
			expect(playerManager.players.value.find(p => p.id === idToDelete)).toBeUndefined();
		});
	});
});

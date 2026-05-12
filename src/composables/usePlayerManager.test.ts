import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePlayerManager } from './usePlayerManager';
import { generateId } from '@/utilities/id';
import { useRules } from './useRules';

/* ========================================================================== */

function addPlayers(playerManager: ReturnType<typeof usePlayerManager>, count: number): void {
	for (let i = 0; i < count; i++) {
		playerManager.addNewPlayer(`Player ${i + 1}`);
	}
}

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('usePlayerManager', () => {
	describe('addNewPlayer', () => {
		it('should return undefined if the name is not a valid name', () => {
			const playerManager = usePlayerManager();

			expect(playerManager.addNewPlayer('')).toBeUndefined();
			expect(playerManager.addNewPlayer('   ')).toBeUndefined();

			expect(playerManager.players.value).toHaveLength(0);
		});

		it('should add a new player with the specified name', () => {
			const playerManager = usePlayerManager();

			const name = 'John Doe';
			const id = playerManager.addNewPlayer(name);

			expect(id).toBeDefined();
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
			const id = playerManager.addNewPlayer('John Doe');

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
			const idJohn = playerManager.addNewPlayer('John Doe');
			const idJane = playerManager.addNewPlayer('Jane Doe');

			playerManager.deletePlayer(idJohn!);

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

			addPlayers(playerManager, useRules().maximumNumberOfPlayers);

			expect(playerManager.hasExceededMaximum.value).toBe(false);
		});

		it('should return true when the number of players is greater than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().maximumNumberOfPlayers + 1);

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

			addPlayers(playerManager, useRules().maximumNumberOfPlayers - 1);

			expect(playerManager.hasReachedMaximum.value).toBe(false);
		});

		it('should return true when the number of players is equal to the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().maximumNumberOfPlayers);

			expect(playerManager.hasReachedMaximum.value).toBe(true);
		});

		it('should return true when the number of players is greater than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().maximumNumberOfPlayers + 1);

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

			addPlayers(playerManager, useRules().minimumNumberOfPlayers - 1);

			expect(playerManager.hasReachedMinimum.value).toBe(false);
		});

		it('should return true when the number of players is equal to the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().minimumNumberOfPlayers);

			expect(playerManager.hasReachedMinimum.value).toBe(true);
		});

		it('should return true when the number of players is greater than the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().minimumNumberOfPlayers + 1);

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

			addPlayers(playerManager, useRules().minimumNumberOfPlayers - 1);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(false);
		});

		it('should return true when the number of players is equal to the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().minimumNumberOfPlayers);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(true);
		});

		it('should return true when the number of players is greater than the minimum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().minimumNumberOfPlayers + 1);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(true);
		});

		it('should return true when the number of players is equal to the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().maximumNumberOfPlayers);

			expect(playerManager.hasValidNumberOfActivePlayers.value).toBe(true);
		});

		it('should return false when the number of players is greater than the maximum', () => {
			const playerManager = usePlayerManager();

			addPlayers(playerManager, useRules().maximumNumberOfPlayers + 1);

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

			const idJohn = playerManager.addNewPlayer('John Doe');
			const idJane = playerManager.addNewPlayer('Jane Doe');
			const idJim = playerManager.addNewPlayer('Jim Doe');

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

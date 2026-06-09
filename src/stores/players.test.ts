import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { PlayerIdNotFoundError } from '@/errors';

import { generateId } from '@/utilities/id';

import { usePlayersStore, type Player } from './players';

/* ========================================================================== */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Players Store', () => {
	describe('addPlayer', () => {
		it('should add a player to the store', () => {
			const playerStore = usePlayersStore();
			const player: Player = { active: true, id: generateId(), name: 'John Doe' };
			playerStore.addPlayer(player);
			expect(playerStore.players[0]).toEqual(player);
		});

		it('should store a copy of the player, not the original reference', () => {
			const playerStore = usePlayersStore();
			const player: Player = { active: true, id: generateId(), name: 'John Doe' };
			playerStore.addPlayer(player);
			expect(playerStore.players[0]).not.toBe(player);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('removePlayerById', () => {
		it('should remove the player with the specified ID from the store', () => {
			const playerStore = usePlayersStore();
			const player1: Player = { active: true, id: generateId(), name: 'John Doe' };
			const player2: Player = { active: true, id: generateId(), name: 'Jane Doe' };
			playerStore.addPlayer(player1);
			playerStore.addPlayer(player2);

			playerStore.removePlayerById(player1.id);

			expect(playerStore.players).toHaveLength(1);
			expect(playerStore.players[0]).toEqual(player2);
		});

		it('should do nothing if the player with the specified ID is not found', () => {
			const playerStore = usePlayersStore();
			const player: Player = { active: true, id: generateId(), name: 'John Doe' };
			playerStore.addPlayer(player);

			playerStore.removePlayerById(generateId());

			expect(playerStore.players).toHaveLength(1);
			expect(playerStore.players[0]).toEqual(player);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('updatePlayerById', () => {
		it('should update the player with the specified ID with the new values', () => {
			const playerStore = usePlayersStore();
			const player1: Player = { active: true, id: generateId(), name: 'John Doe' };
			const player2: Player = { active: true, id: generateId(), name: 'Jane Doe' };
			playerStore.addPlayer(player1);
			playerStore.addPlayer(player2);

			playerStore.updatePlayerById(player1.id, 'name', 'John Does');

			expect(playerStore.players[0]).toEqual({ ...player1, name: 'John Does' });
			expect(playerStore.players[1]).toEqual(player2);
		});

		it('should throw an error if the player with the specified ID is not found', () => {
			const playerStore = usePlayersStore();

			expect(() => playerStore.updatePlayerById(generateId(), 'name', 'Jane Doe')).toThrow(PlayerIdNotFoundError);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('activePlayers', () => {
		it('should return an empty array if there are no players', () => {
			const playerStore = usePlayersStore();

			expect(playerStore.activePlayers).toHaveLength(0);
		});

		it('should return an empty array if there are no active players', () => {
			const playerStore = usePlayersStore();
			const player1: Player = { active: false, id: generateId(), name: 'John Doe' };
			playerStore.addPlayer(player1);

			expect(playerStore.activePlayers).toHaveLength(0);
		});

		it('should return the list of active players', () => {
			const playerStore = usePlayersStore();

			const player1: Player = { active: true, id: generateId(), name: 'John Doe' };
			const player2: Player = { active: false, id: generateId(), name: 'Jane Doe' };
			const player3: Player = { active: true, id: generateId(), name: 'Joe Doe' };
			playerStore.addPlayer(player1);
			playerStore.addPlayer(player2);
			playerStore.addPlayer(player3);

			expect(playerStore.activePlayers).toHaveLength(2);
			expect(playerStore.activePlayers[0]).toEqual(player1);
			expect(playerStore.activePlayers[1]).toEqual(player3);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('getPlayerById', () => {
		it('should return undefined if the player with the specified ID is not found', () => {
			const playerStore = usePlayersStore();
			expect(playerStore.getPlayerById(generateId())).toBeUndefined();
		});

		it('should return a copy of the player with the specified ID', () => {
			const playerStore = usePlayersStore();
			const player: Player = { active: true, id: generateId(), name: 'John Doe' };
			playerStore.addPlayer(player);

			const playerCopy = playerStore.getPlayerById(player.id);
			expect(playerCopy).toEqual(player);
			expect(playerCopy).not.toBe(playerStore.players[0]);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('$reset', () => {
		it('should reset the players store', () => {
			const playerStore = usePlayersStore();
			playerStore.addPlayer({ active: true, id: generateId(), name: 'John Doe' });
			playerStore.$reset();
			expect(playerStore.players).toHaveLength(0);
		});
	});
});

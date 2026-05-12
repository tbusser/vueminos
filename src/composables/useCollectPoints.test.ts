import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { generateId } from '@/utilities/id';

import { usePlayersStore } from '@/stores/players';
import { useRoundsStore } from '@/stores/rounds';

import { useCollectPoints } from './useCollectPoints';

/* ========================================================================== */

function createRoundWithPlayers(ids: Id[]): void {
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();

	ids.forEach(id => {
		playersStore.addPlayer({ active: true, id, name: id });
	});

	roundsStore.addRound({
		id: generateId(),
		isCurrentRound: true,
		phase: 'round-end',
		playerStats: ids.map(id => ({ id, score: 0, tiles: 0 }))
	});
}

function setWinner(winnerId: Id): void {
	const roundsStore = useRoundsStore();

	roundsStore.updateCurrentRound({ winnerId });
}

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useCollectPoints', () => {
	describe('collectedPoints', () => {
		it('should be an empty object when there are no active players', () => {
			const { collectedPoints } = useCollectPoints();

			expect(collectedPoints.value).toEqual({});
		});

		it('should contain all players when the round is blocked', () => {
			const playerAId = generateId();
			const playerBId = generateId();
			const playerCId = generateId();

			createRoundWithPlayers([playerAId, playerBId, playerCId]);
			const { collectedPoints } = useCollectPoints();

			expect(collectedPoints.value).toEqual({
				[playerAId]: undefined,
				[playerBId]: undefined,
				[playerCId]: undefined
			});
		});

		it('should be an object with all the players except the winner', () => {
			const playerAId = generateId();
			const playerBId = generateId();
			const playerCId = generateId();

			createRoundWithPlayers([playerAId, playerBId, playerCId]);
			setWinner(playerAId);

			const { collectedPoints } = useCollectPoints();

			expect(collectedPoints.value).toEqual({
				[playerBId]: undefined,
				[playerCId]: undefined
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('hasPlayerWonTheRound', () => {
		it('should return false when the player is not the winner', () => {
			const playerAId = generateId();

			createRoundWithPlayers([playerAId]);

			const { hasPlayerWonTheRound } = useCollectPoints();

			expect(hasPlayerWonTheRound(playerAId)).toBe(false);
		});

		it('should return true when the player is the winner', () => {
			const playerAId = generateId();

			createRoundWithPlayers([playerAId]);
			setWinner(playerAId);

			const { hasPlayerWonTheRound } = useCollectPoints();

			expect(hasPlayerWonTheRound(playerAId)).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('isComplete', () => {
		it('should return false as long as a player has not collected points', () => {
			const playerAId = generateId();
			const playerBId = generateId();
			const playerCId = generateId();

			createRoundWithPlayers([playerAId, playerBId, playerCId]);

			const { isComplete } = useCollectPoints();

			expect(isComplete.value).toBe(false);
		});

		it('should return true when all players have collected points', () => {
			const playerAId = generateId();
			const playerBId = generateId();
			const playerCId = generateId();

			createRoundWithPlayers([playerAId, playerBId, playerCId]);

			const { isComplete, setCollectedPoints } = useCollectPoints();

			setCollectedPoints(playerAId, 10);
			setCollectedPoints(playerBId, 20);
			setCollectedPoints(playerCId, 30);

			expect(isComplete.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('setCollectedPoints', () => {
		it('should set the collected points for the player', () => {
			const playerAId = generateId();

			createRoundWithPlayers([playerAId]);

			const { collectedPoints, setCollectedPoints } = useCollectPoints();

			setCollectedPoints(playerAId, 10);

			expect(collectedPoints.value[playerAId]).toBe(10);
		});

		it('should clear the points for the player when the points are set to undefined', () => {
			const playerAId = generateId();

			createRoundWithPlayers([playerAId]);

			const { collectedPoints, setCollectedPoints } = useCollectPoints();

			setCollectedPoints(playerAId, 10);
			setCollectedPoints(playerAId, undefined);

			expect(collectedPoints.value[playerAId]).toBeUndefined();
		});

		it('should not set the collected points for a player who is not in the round', () => {
			const playerAId = generateId();
			const playerBId = generateId();

			createRoundWithPlayers([playerAId]);

			const { collectedPoints, setCollectedPoints } = useCollectPoints();

			setCollectedPoints(playerBId, 10);

			expect(collectedPoints.value[playerBId]).toBeUndefined();
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('winningPlayerName', () => {
		it('should return undefined when the round is blocked', () => {
			const playerAId = generateId();
			const playerBId = generateId();
			const playerCId = generateId();

			createRoundWithPlayers([playerAId, playerBId, playerCId]);

			const { winningPlayerName } = useCollectPoints();

			expect(winningPlayerName.value).toBeUndefined();
		});

		it('should return the name of the winner when the round is not blocked', () => {
			const playerAId = generateId();
			const playerBId = generateId();
			const playerCId = generateId();

			createRoundWithPlayers([playerAId, playerBId, playerCId]);
			setWinner(playerAId);

			const { winningPlayerName } = useCollectPoints();

			expect(winningPlayerName.value).toEqual(playerAId);
		});
	});
});

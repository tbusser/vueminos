import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { usePlayersStore } from '@/stores/players';
import { useTurnsStore } from '@/stores/turns';

import { createCurrentRound } from '@/test-factories';

import { generateId } from '@/utilities/id';

import { useTurnHistory } from './useTurnHistory';

/* ========================================================================== */

function createRoundWithPlayers(ids: Id[], turns: number): Id[] {
	const playersStore = usePlayersStore();
	ids.forEach(id => {
		playersStore.addPlayer({ active: true, id, name: id });
	});

	createCurrentRound(ids);

	const turnStore = useTurnsStore();
	return new Array(turns).fill(0).map((_, index) => {
		const id = generateId();

		turnStore.addTurn({
			bonusBridge: false,
			bonusDouble: false,
			bonusHexagon: false,
			triple: false,
			id,
			playerId: ids[index % ids.length],
			score: 0,
			tilesDrawn: 0,
			tilesPlayed: 1,
			tileValue: 6
		} satisfies Turn);

		return id;
	});
}

/* -------------------------------------------------------------------------- */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('useTurnHistory', () => {
	describe('canGoBack', () => {
		it('should return false when there is no historical turn', () => {
			createRoundWithPlayers([generateId(), generateId()], 0);

			const { canGoBack } = useTurnHistory();

			expect(canGoBack.value).toBe(false);
		});

		it('should return false when the oldest navigable turn in the history is selected', () => {
			createRoundWithPlayers([generateId(), generateId()], 4);

			const { canGoBack, goBack } = useTurnHistory();
			goBack();
			goBack();

			expect(canGoBack.value).toBe(false);
		});

		it('should return true before any navigation has occurred', () => {
			createRoundWithPlayers([generateId(), generateId()], 1);

			const { canGoBack } = useTurnHistory();

			expect(canGoBack.value).toBe(true);
		});

		it('should return true when a non-oldest historical turn is selected', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);

			const { canGoBack, goBack } = useTurnHistory();
			goBack();

			expect(canGoBack.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('canGoForward', () => {
		it('should return false when there is no historical turn', () => {
			createRoundWithPlayers([generateId(), generateId()], 0);

			const { canGoForward } = useTurnHistory();

			expect(canGoForward.value).toBe(false);
		});

		it('should return false when no navigation back has occurred yet', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);

			const { canGoForward } = useTurnHistory();

			expect(canGoForward.value).toBe(false);
		});

		it('should return true when a historical turn is selected', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);

			const { canGoForward, goBack } = useTurnHistory();
			goBack();

			expect(canGoForward.value).toBe(true);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('goBack', () => {
		it('should do nothing when there is no historical turn', () => {
			createRoundWithPlayers([generateId(), generateId()], 0);

			const { goBack, turn } = useTurnHistory();
			goBack();

			expect(turn.value).toBeNull();
		});

		it('should navigate from newest to oldest turn in the history', () => {
			const ids = createRoundWithPlayers([generateId(), generateId()], 2);

			const { goBack, turn } = useTurnHistory();

			goBack();
			expect(turn.value?.id).toBe(ids[1]);

			goBack();
			expect(turn.value?.id).toBe(ids[0]);
		});

		it('should not navigate past the oldest turn in the history', () => {
			const ids = createRoundWithPlayers([generateId(), generateId()], 4);

			const { goBack, turn } = useTurnHistory();

			goBack();
			goBack();
			goBack();

			expect(turn.value?.id).toBe(ids[2]);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('goForward', () => {
		it('should do nothing when there is no historical turn', () => {
			createRoundWithPlayers([generateId(), generateId()], 0);

			const { goForward, turn } = useTurnHistory();
			goForward();

			expect(turn.value).toBeNull();
		});

		it('should do nothing when no navigation back has occurred yet', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);

			const { goForward, turn } = useTurnHistory();
			goForward();

			expect(turn.value).toBeNull();
		});

		it('should select the next most recent historical turn', () => {
			const ids = createRoundWithPlayers([generateId(), generateId()], 4);

			const { goBack, goForward, turn } = useTurnHistory();
			goBack();
			goBack();

			goForward();
			expect(turn.value?.id).toBe(ids[3]);
		});

		it('should return to the live round when navigating forward from the most recent historical turn', () => {
			createRoundWithPlayers([generateId(), generateId()], 4);

			const { goBack, goForward, turn } = useTurnHistory();
			goBack();
			goForward();

			expect(turn.value).toBeNull();
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('player', () => {
		it('should be null when no navigation has occurred yet', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);

			const { player } = useTurnHistory();

			expect(player.value).toBeNull();
		});

		it('should reflect the player of the selected historical turn', () => {
			const playerAId = generateId();
			const playerBId = generateId();
			createRoundWithPlayers([playerAId, playerBId], 2);

			const { goBack, player } = useTurnHistory();
			goBack();
			expect(player.value?.id).toBe(playerBId);

			goBack();
			expect(player.value?.id).toBe(playerAId);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('turn', () => {
		it('should be null when no navigation has occurred yet', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);

			const { turn } = useTurnHistory();

			expect(turn.value).toBeNull();
		});

		it('should reflect the selected historical turn', () => {
			const ids = createRoundWithPlayers([generateId(), generateId()], 2);

			const { goBack, turn } = useTurnHistory();
			goBack();
			expect(turn.value?.id).toBe(ids[1]);

			goBack();
			expect(turn.value?.id).toBe(ids[0]);
		});

		it('should be null after navigating forward to the live round', () => {
			createRoundWithPlayers([generateId(), generateId()], 2);

			const { goBack, goForward, turn } = useTurnHistory();
			goBack();
			goForward();
			expect(turn.value).toBeNull();
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('navigation flow', () => {
		it('should traverse all navigable turns and return to the live round', () => {
			const ids = createRoundWithPlayers([generateId(), generateId()], 4);

			const { goBack, goForward, turn } = useTurnHistory();

			// Navigate back through the entire navigable window.
			goBack();
			expect(turn.value?.id).toBe(ids[3]);

			goBack();
			expect(turn.value?.id).toBe(ids[2]);

			// Navigate forward back to the live round.
			goForward();
			expect(turn.value?.id).toBe(ids[3]);

			goForward();
			expect(turn.value).toBeNull();
		});

		it('should navigate within the available turns when not all players have taken a turn yet', () => {
			const ids = createRoundWithPlayers([generateId(), generateId(), generateId()], 1);

			const { canGoBack, canGoForward, goBack, goForward, turn } = useTurnHistory();

			goBack();
			expect(turn.value?.id).toBe(ids[0]);
			expect(canGoBack.value).toBe(false);

			goForward();
			expect(turn.value).toBeNull();
			expect(canGoForward.value).toBe(false);
		});
	});
});

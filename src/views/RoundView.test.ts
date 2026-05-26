import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routeName } from '@/router/routerName';

import { useGameStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/players';
import { useRoundsStore } from '@/stores/rounds';

import RoundView from './RoundView.vue';
import CollectPointsScreen from '@/screens/CollectPointsScreen.vue';
import { createPlayer, createCompletedRound, createCurrentRound } from '@/test-factories';

/* ========================================================================== */

vi.mock('@/i18n');

/* -- Vue Router Mocks ------------------------------------------------------ */

const replaceMock = vi.fn();

vi.mock('vue-router', () => ({
	useRouter: () => ({
		back: vi.fn(),
		replace: replaceMock
	})
}));

/* -------------------------------------------------------------------------- */

function setupGameAtRoundEnd(options: {
	completedRounds?: CompletedRound[];
	pointsLimit: number;
	players: Player[];
	playerStats: PlayerStats[];
	winnerId: Id;
}): void {
	const gameStore = useGameStore();
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();

	gameStore.createNewGame(options.pointsLimit);

	const playerIds = options.players.map(player => {
		playersStore.addPlayer(player);

		return player.id;
	});

	if (options.completedRounds) {
		roundsStore.$patch({ rounds: [...options.completedRounds] });
	}

	roundsStore.addRound(createCurrentRound(playerIds, 'round-end', options.winnerId));
}

/* -------------------------------------------------------------------------- */

beforeEach(() => {
	setActivePinia(createPinia());
	replaceMock.mockClear();
});

/* -------------------------------------------------------------------------- */

describe('RoundView', () => {
	it('should navigate to the game result when the points limit is reached after finishing a round', async () => {
		const winner: Player = createPlayer('Alice');
		const loser: Player = createPlayer('Bob');

		setupGameAtRoundEnd({
			completedRounds: [
				createCompletedRound(winner.id, { [winner.id]: 70, [loser.id]: 30 })
			],
			pointsLimit: 100,
			players: [winner, loser],
			playerStats: [
				{ id: winner.id, score: 20, tiles: 0 },
				{ id: loser.id, score: 5, tiles: 3 }
			],
			winnerId: winner.id
		});

		const wrapper = shallowMount(RoundView);
		const collectScreen = wrapper.findComponent(CollectPointsScreen);

		collectScreen.vm.$emit('navigate-forward', { [loser.id]: 15 });
		await wrapper.vm.$nextTick();

		expect(replaceMock).toHaveBeenCalledWith({ name: routeName.gameResult });
	});

	it('should not navigate to game result when the points limit has not been reached', async () => {
		const winner: Player = createPlayer('Alice');
		const loser: Player = createPlayer('Bob');

		setupGameAtRoundEnd({
			pointsLimit: 400,
			players: [winner, loser],
			playerStats: [
				{ id: winner.id, score: 30, tiles: 0 },
				{ id: loser.id, score: 10, tiles: 3 }
			],
			winnerId: winner.id
		});

		const wrapper = shallowMount(RoundView);
		const collectScreen = wrapper.findComponent(CollectPointsScreen);

		collectScreen.vm.$emit('navigate-forward', { [loser.id]: 5 });
		await wrapper.vm.$nextTick();

		expect(replaceMock).not.toHaveBeenCalled();
	});
});

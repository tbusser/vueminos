import { createRouter, createWebHistory } from 'vue-router';

import { useGameStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/players';
import { useRoundsStore } from '@/stores/rounds';

import { routeName } from '@/router/routerName';

/* ========================================================================== */

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),

	routes: [
		{
			path: '/',
			name: routeName.home,
			component: () => import('../views/GamePlayersView.vue')
		},
		{
			path: '/game-limit',
			name: routeName.gameLimit,
			component: () => import('../views/GameLimitView.vue'),
			meta: {
				requireActivePlayers: true
			}
		},
		{
			path: '/game-result',
			name: routeName.gameResult,
			component: () => import('../views/GameResultView.vue'),
			meta: {
				requireActiveGame: true,
				requireActivePlayers: true,
				requireFinishedGame: true
			}
		},
		{
			path: '/round',
			name: routeName.round,
			component: () => import('../views/RoundView.vue'),
			meta: {
				requireActiveGame: true,
				requireActivePlayers: true
			}
		},
		{
			path: '/settings',
			name: routeName.settings,
			component: () => import('../views/SettingsView.vue')
		}
	]
});

router.beforeEach((to) => {
	const gameStore = useGameStore();
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();

	// Check first if the route requires active players, if these are not
	// present redirect to the home view.
	if (to.meta.requireActivePlayers && !playersStore.hasActivePlayers) {
		return { name: routeName.home };
	}

	// We know now that there are active players, so we can check if the route
	// requires an active game. When no active game is present, redirect to the
	// game limit view.
	if (to.meta.requireActiveGame && !gameStore.hasActiveGame) {
		return { name: routeName.gameLimit };
	}

	// We know there is a game, so we can check if the route requires a finished
	// game. When there is a current round, the game is not yet finished. In
	// this case, redirect to the round view.
	if (to.meta.requireFinishedGame && roundsStore.hasCurrentRound) {
		return { name: routeName.round };
	}
});

/* ========================================================================== */

export {
	router
};

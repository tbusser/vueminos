import { createRouter, createWebHistory } from 'vue-router';

import GamePlayersView from '@/views/GamePlayersView.vue';
import { useGameStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/players';

import { routeName } from '@/router/routerName';

/* ========================================================================== */

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),

	routes: [
		{
			path: '/',
			name: routeName.home,
			component: GamePlayersView
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

	// Check first if the route requires active players, if these are not
	// present redirect to the home view.
	if (to.meta.requireActivePlayers && !playersStore.hasActivePlayers) {
		return { name: routeName.home };
	}

	// We know now that there are active players, so we can check if the route
	// requires an active game. When no active game is present, redirect to the
	// game limit view.
	if (to.meta.requireActiveGame && gameStore.startTimestamp === undefined) {
		return { name: routeName.gameLimit };
	}
});

/* ========================================================================== */

export {
	router
};

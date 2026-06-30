import { createRouter, createWebHashHistory } from 'vue-router';

import { useGameStore } from '@/stores/game';
import { usePlayersStore } from '@/stores/players';
import { useRoundsStore } from '@/stores/rounds';

import { routeName } from '@/router/routerName';

import { evaluateRoute } from '@/utilities/navigationPolicy';

/* ========================================================================== */

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),

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
		}
	]
});

router.beforeEach(to => {
	const gameStore = useGameStore();
	const playersStore = usePlayersStore();
	const roundsStore = useRoundsStore();

	return evaluateRoute(to, {
		hasActivePlayers: playersStore.hasActivePlayers,
		hasActiveGame: gameStore.hasActiveGame,
		hasCurrentRound: roundsStore.hasCurrentRound
	});
});

/* ========================================================================== */

export {
	router
};

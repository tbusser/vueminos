import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';

import { routeName } from '@/router/routerName';

/* ========================================================================== */

type NavigationState = {
	hasActivePlayers: boolean;
	hasActiveGame: boolean;
	hasCurrentRound: boolean;
};

/* ========================================================================== */

export function evaluateRoute(to: RouteLocationNormalized, state: NavigationState): RouteLocationRaw | undefined {
	// Check first if the route requires active players, if these are not
	// present redirect to the home view.
	if (to.meta.requireActivePlayers && !state.hasActivePlayers) {
		return { name: routeName.home };
	}

	// We know now that there are active players, so we can check if the
	// route requires an active game. When no active game is present,
	// redirect to the game limit view.
	if (to.meta.requireActiveGame && !state.hasActiveGame) {
		return { name: routeName.gameLimit };
	}

	// We know there is a game, so we can check if the route requires a
	// finished game. When there is a current round, the game is not yet
	// finished. In this case, redirect to the round view.
	if (to.meta.requireFinishedGame && state.hasCurrentRound) {
		return { name: routeName.round };
	}

	// When arriving at home, forward to the deepest applicable view.
	if (to.name === routeName.home) {
		if (state.hasActivePlayers && state.hasActiveGame) {
			if (state.hasCurrentRound) {
				return { name: routeName.round };
			}

			return { name: routeName.gameResult };
		}
	}

	// No special handling is needed for this route.
	return undefined;
}

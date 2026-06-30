import type { RouteLocationNormalized, RouteMeta } from 'vue-router';
import { describe, expect, it } from 'vitest';

import { routeName } from '@/router/routerName';

import { evaluateRoute } from './navigationPolicy';

/* ========================================================================== */

function createRoute(name: string, meta: RouteMeta = {}): RouteLocationNormalized {
	return {
		fullPath: name,
		hash: '',
		matched: [],
		meta,
		name,
		params: {},
		path: name,
		query: {},
		redirectedFrom: undefined
	};
}

/* -------------------------------------------------------------------------- */

describe('navigationPolicy', () => {
	describe('evaluateRoute', () => {
		describe('requireActivePlayers', () => {
			it('should redirect to home when there are no active players', () => {
				const route = createRoute(routeName.round, { requireActivePlayers: true });
				const state = { hasActivePlayers: false, hasActiveGame: false, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toEqual({ name: routeName.home });
			});

			it('should allow the route when there are active players', () => {
				const route = createRoute(routeName.round, { requireActivePlayers: true });
				const state = { hasActivePlayers: true, hasActiveGame: false, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toBeUndefined();
			});
		});

		/* -------------------------------------------------------------- */

		describe('requireActiveGame', () => {
			it('should redirect to the game limit when there is no active game', () => {
				const route = createRoute(routeName.round, { requireActiveGame: true });
				const state = { hasActivePlayers: true, hasActiveGame: false, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toEqual({ name: routeName.gameLimit });
			});

			it('should allow the route when there is an active game', () => {
				const route = createRoute(routeName.round, { requireActiveGame: true });
				const state = { hasActivePlayers: true, hasActiveGame: true, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toBeUndefined();
			});
		});

		/* -------------------------------------------------------------- */

		describe('requireFinishedGame', () => {
			it('should redirect to the round when the game is not finished', () => {
				const route = createRoute(routeName.gameResult, { requireFinishedGame: true });
				const state = { hasActivePlayers: true, hasActiveGame: true, hasCurrentRound: true };

				expect(evaluateRoute(route, state)).toEqual({ name: routeName.round });
			});

			it('should allow the route when the game is finished', () => {
				const route = createRoute(routeName.gameResult, { requireFinishedGame: true });
				const state = { hasActivePlayers: true, hasActiveGame: true, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toBeUndefined();
			});
		});

		/* -------------------------------------------------------------- */

		describe('home forwarding', () => {
			it('should forward to the round when a round is in progress', () => {
				const route = createRoute(routeName.home);
				const state = { hasActivePlayers: true, hasActiveGame: true, hasCurrentRound: true };

				expect(evaluateRoute(route, state)).toEqual({ name: routeName.round });
			});

			it('should forward to the game result when the game has no current round', () => {
				const route = createRoute(routeName.home);
				const state = { hasActivePlayers: true, hasActiveGame: true, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toEqual({ name: routeName.gameResult });
			});

			it('should stay on home when there is no active game', () => {
				const route = createRoute(routeName.home);
				const state = { hasActivePlayers: true, hasActiveGame: false, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toBeUndefined();
			});

			it('should stay on home when there are no active players', () => {
				const route = createRoute(routeName.home);
				const state = { hasActivePlayers: false, hasActiveGame: true, hasCurrentRound: true };

				expect(evaluateRoute(route, state)).toBeUndefined();
			});
		});

		/* -------------------------------------------------------------- */

		describe('precedence', () => {
			it('should redirect to the game limit when players are present but no game exists', () => {
				const route = createRoute(routeName.round, {
					requireActiveGame: true,
					requireActivePlayers: true
				});
				const state = { hasActivePlayers: true, hasActiveGame: false, hasCurrentRound: false };

				expect(evaluateRoute(route, state)).toEqual({ name: routeName.gameLimit });
			});
		});

		/* -------------------------------------------------------------- */

		it('should allow a route without requirements', () => {
			const route = createRoute(routeName.gameLimit);
			const state = { hasActivePlayers: false, hasActiveGame: false, hasCurrentRound: false };

			expect(evaluateRoute(route, state)).toBeUndefined();
		});
	});
});

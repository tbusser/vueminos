import 'vue-router';

/* ========================================================================== */

export {};

/* ========================================================================== */

declare module 'vue-router' {
	interface RouteMeta {
		/**
		 * Whether the route requires an active game.
		 */
		requireActiveGame?: boolean;

		/**
		 * Whether the route requires active players.
		 */
		requireActivePlayers?: boolean;
	}
}

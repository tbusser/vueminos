import 'vue-router';

/* ========================================================================== */

export {};

/* ========================================================================== */

declare module 'vue-router' {
	interface RouteMeta {
		/**
		 * Whether the route requires an active game. Note that a finished game
		 * is still considered active.
		 */
		requireActiveGame?: boolean;

		/**
		 * Whether the route requires active players.
		 */
		requireActivePlayers?: boolean;

		/**
		 * Whether the route requires a finished game.
		 */
		requireFinishedGame?: boolean;
	}
}

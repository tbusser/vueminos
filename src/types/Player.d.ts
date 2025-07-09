export {};

/* ========================================================================== */

declare global {
	type Player = {
		/**
		 * Indicates whether the player is currently active in the game.
		 * Inactive players should not be given a turn in the current round.
		 *
		 * @example true
		 */
		active: boolean;

		/**
		 * A unique identifier for the player.
		 *
		 * @example '123e4567-e89b-12d3-a456-426614174000'
		 */
		id: Id;

		/**
		 * The name of the player.
		 *
		 * @example 'Alice'
		 */
		name: string;
	};
}

export {};

/* ========================================================================== */

declare global {
	/**
	 * Represents the number of tiles each player has in their hands in the
	 * current round. The keys are player IDs, and the values are the number of
	 * tiles each player has in their hands.
	 *
	 * @example {
	 *     '123e4567-e89b-12d3-a456-426614174000': 4,
	 *     ...
	 * }
	 */
	type TilesPerPlayer = {
		[id: Id]: number;
	};
}

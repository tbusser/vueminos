export {};

/* ========================================================================== */


declare global {
	/**
	 * Represents the points left over at the end of a round for each player.
	 * The keys are player IDs, and the values are the points leftover for
	 * each player.
	 */
	type LeftoverPoints = {
		[id: Id]: number;
	};
}

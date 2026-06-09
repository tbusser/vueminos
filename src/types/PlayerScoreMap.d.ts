export {};

/* ========================================================================== */

declare global {
	/**
	 * Represents the score of each player. The keys are player IDs, and the
	 * values are the number of points.
	 *
	 * @example {
	 *     '123e4567-e89b-12d3-a456-426614174000': 4,
	 *     ...
	 * }
	 */
	type PlayerScoreMap = Record<Id, number>;
}

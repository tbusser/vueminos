export {};

/* ========================================================================== */

type TurnBase = {
	/**
		 * The ID of the turn.
		 *
		 * @example '123e4567-e89b-12d3-a456-426614174000'
		 */
	id: Id;

	/**
	 * The ID of the player who made this turn.
	 *
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	playerId: Id;

	/**
	 * The ID of the round this turn belongs to.
	 *
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	roundId: Id;

	/**
	 * The total score for this turn after all bonuses and penalties have
	 * been applied.
	 *
	 * @example 12
	 */
	score: number;

	/**
	 * The number of tiles drawn in this turn.
	 *
	 * @example 0
	 */
	tilesDrawn: number;
};

declare global {
	type SkippedTurn = TurnBase & {
		/**
		 * The number of points of the tile played in the turn. This is
		 * undefined for a skipped turn, as no tile was played.
		 *
		 * @example undefined
		 */
		tileValue: undefined;

		/**
		 * The number of tiles played in this turn. This must be 0 for a
		 * skipped turn, as no tile was played.
		 *
		 * @example 0
		 */
		tilesPlayed: 0;
	};

	type PlayedTurn = TurnBase & {
		/**
		 * Whether the player used a bonus bridge in this turn.
		 *
		 * @example false
		 */
		bonusBridge: boolean;

		/**
		 * Whether the player used a bonus double in this turn.
		 *
		 * @example false
		 */
		bonusDouble: boolean;

		/**
		 * Whether the player used a bonus hexagon in this turn.
		 *
		 * @example false
		 */
		bonusHexagon: boolean;

		/**
		 * The number of points of the tile played in the turn. This can be
		 * undefined if the player was not able to play any tiles in this turn.
		 *
		 * @example 12
		 */
		tileValue: number;

		/**
		 * The number of tiles played in this turn. This must be 1 for a turn
		 * where a tile was played.
		 *
		 * @example 1
		 */
		tilesPlayed: 1;

		/**
		 * Indicates whether the player played a triple in this turn. This is
		 * only relevant for the first turn of a round.
		 *
		 * @example true
		 */
		triple: boolean;
	};

	type Turn = SkippedTurn | PlayedTurn;

	type ScoredTurnInput = Omit<Turn, 'id' | 'playerId' | 'roundId'>;

	type TurnInput = Omit<ScoredTurnInput, 'score'>;
}

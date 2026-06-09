type BaseRound = {
	/**
	 * The unique identifier of the round.
	 *
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	id: Id;
};

/* ========================================================================== */

/**
 * Represents the score of each player. The keys are player IDs, and the
 * values are the number of points.
 *
 * @example {
 *     '123e4567-e89b-12d3-a456-426614174000': 4,
 *     ...
 * }
 */
export type PlayerScoreMap = Record<Id, number>;

export type PlayerStats = {
	/**
	 * The unique identifier of the player.
	 */
	id: Id;

	/**
	 * The cumulative score of all turns the player has taken in this round.
	 */
	score: number;

	/**
	 * The number of the tiles the player has in his/her hand. This should
	 * always be a positive integer or zero.
	 *
	 * @example 4
	 */
	tiles: number;
};

export type RoundPhase = 'player-select' | 'turns' | 'round-end';

export type CurrentRound = BaseRound & {
	/**
	 * The ID of the player who is currently taking their turn in the round.
	 * This can be undefined as long as the starting player hasn't been
	 * determined yet. When it is undefined, phase must be 'player-select'.
	 *
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	currentPlayerId?: Id;

	/**
	 * Indicates whether the round is blocked. A round is blocked when all
	 * players have passed.
	 */
	isBlocked?: boolean;

	/**
	 * Indicates this the current round of the game.
	 */
	isCurrentRound: true;

	/**
	 * The phase of the round. This can be one of the following:
	 * - 'player-select': The round is in the player selection phase.
	 * - 'turns': The round is in the turns phase, where players take
	 *   their turns.
	 * - 'round-end': The round is in the end phase, where the players sum
	 *   up their remaining points to distribute to the winner.
	 */
	phase: RoundPhase;

	/**
	 * A record of player statistics for the current round. The keys are
	 * player IDs and the values are their cumulative score and tile count.
	 *
	 * @example {
	 *     '123e4567-e89b-12d3-a456-426614174000': { score: 10, tiles: 4 },
	 *     ...
	 * }
	 *
	 * @see PlayerStats
	 */
	playerStats: PlayerStats[];

	/**
	 * The ID of the player who won the round. This is undefined as long as
	 * the phase is not 'round-end'.
	 *
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	winnerId?: Id;
};

export type CompletedRound = BaseRound & {
	/**
	 * Indicates this is not the current round of the game.
	 */
	isCurrentRound: false;

	/**
	 * A record of scores for each player in the round. The keys are
	 * player IDs and the values are the scores they achieved in this round.
	 */
	scores: PlayerScoreMap;

	/**
	 * The ID of the player who won the round.
	 *
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	winnerId: Id;
};

export type Round = CurrentRound | CompletedRound;

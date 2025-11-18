import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayersStore } from '@/stores/players';
import { generateId } from '@/utilities/id';

/* ========================================================================== */

/**
 * The points to be awarded to the winner of a round.
 */
type RoundEndPoints = {
	/**
	 * The number of points to be awarded to the winner of the round.
	 * @example 42
	 */
	points: number;

	/**
	 * The ID of the player who won the round.
	 * @example '123e4567-e89b-12d3-a456-426614174000'
	 */
	winnerId: Id;
};

/* ========================================================================== */

const minimumNumberOfPlayers = 2;
const maximumNumberOfPlayers = 6;

const scoreModifiers = {
	bridge: 40,
	doubleSided: 40,
	hexagon: 50,
	skippedTurn: -10,
	tileDrawn: -5,
	wonGame: 25
} as const;

/* ========================================================================== */

export function useRules() {
	const playerStore = usePlayersStore();

	/* ---------------------------------------------------------------------- */

	const { activePlayers } = storeToRefs(playerStore);

	/* ---------------------------------------------------------------------- */

	function determineBlockedRoundWinnerAndPoints(leftoverPoints: Record<Id, number>): RoundEndPoints {
		const playerIds = Object.keys(leftoverPoints) as Id[];
		// The player with the least points is the winner of a blocked round.
		const winnerPlayer = playerIds.reduce((winner, id: Id) => {
			return leftoverPoints[id] < winner.points
				? { id, points: leftoverPoints[id] }
				: winner;
		}, { id: generateId(), points: Infinity });

		// Calculate the points to be awarded to the winner. The winner's points
		// are subtracted from the total points of all players, while the points
		// of the other players are added to the total.
		const points: number = playerIds.reduce((sum, id) => {
			return id === winnerPlayer.id
				? sum - leftoverPoints[id]
				: sum + leftoverPoints[id];
		}, 0);

		return {
			points,
			winnerId: winnerPlayer.id
		};
	}

	function determineWonRoundWinnerAndPoints(leftoverPoints: Record<Id, number>, winnerId: Id): RoundEndPoints {
		const totalLeftoverPoints: number = Object.values(leftoverPoints).reduce((sum, points) => sum + points, 0);
		const points: number = scoreModifiers.wonGame + totalLeftoverPoints;

		return {
			points,
			winnerId
		};
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Calculates the points to be awarded to the winner of the round as well
	 * as the ID of the player who won the round.
	 *
	 * @param leftoverPoints A record of leftover points for each player at the
	 *        end of the round. When the round is not blocked, the player to
	 *        reach 0 tiles should be excluded.
	 *
	 * @returns The points to be awarded to the winner of the round and the
	 *          ID of the player who won the round.
	 */
	function determineRoundWinnerAndPoints(
		leftoverPoints: Record<Id, number>, isBlocked: boolean, winnerId: Id | undefined
	): RoundEndPoints {
		return isBlocked === true
			? determineBlockedRoundWinnerAndPoints(leftoverPoints)
			: determineWonRoundWinnerAndPoints(leftoverPoints, winnerId as Id);
	}

	/**
	 * Calculates the bonus score a player receives for the played tile in the
	 * opening turn of a round.
	 *
	 * @param tileValue The number of points the tile played in the turn
	 *        is worth.
	 *
	 * @returns The number of bonus stones the player receives for the played
	 *          tile. If the tile value is undefined, it returns 0.
	 */
	function calculateStartingStoneBonus(tileValue?: number): number {
		if (tileValue === undefined) return 0;

		return tileValue === 0 ? 40 : 10;
	}

	/**
	 * Calculates the number of starting stones based on the number of
	 * active players. When there are no active players, it defaults to 0.
	 */
	const startingStoneCount = computed<number>(() => {
		if (activePlayers.value.length === 2) return 9;

		if (
			activePlayers.value.length === 3 ||
			activePlayers.value.length === 4
		) return 7;

		if (
			activePlayers.value.length === 5 ||
			activePlayers.value.length === 6
		) return 6;

		return 0;
	});

	function calculateTurnScore(turn: TurnInput): number {
		const hasPlayedTile = turn.tilesPlayed === 1;

		// Initialize the score. When no tiles have been played, the score is
		// the penalty for skipping a turn. Otherwise, it is the value of the
		// tile played in the turn.
		let score = hasPlayedTile
			? turn.tileValue
			: scoreModifiers.skippedTurn;

		// When tiles have been taken from the well, subtract the penalty for
		// each tile drawn.
		if (turn.tilesDrawn > 0) score += scoreModifiers.tileDrawn * turn.tilesDrawn;

		if (hasPlayedTile) {
			// Add bonus points for the played tile if it is a triple, this can
			// only be true for the first turn of a round.
			if (turn.triple) score += calculateStartingStoneBonus(turn.tileValue);

			// Check for the special bonuses that can be applied to the
			// turn score.
			if (turn.bonusBridge) score += scoreModifiers.bridge;
			if (turn.bonusDouble) score += scoreModifiers.doubleSided;
			if (turn.bonusHexagon) score += scoreModifiers.hexagon;
		}

		// Return the final score for the turn.
		return score;
	}

	/* ---------------------------------------------------------------------- */

	return {
		calculateStartingStoneBonus,
		calculateTurnScore,
		determineRoundWinnerAndPoints,
		maximumNumberOfPlayers,
		minimumNumberOfPlayers,
		startingStoneCount
	};
}

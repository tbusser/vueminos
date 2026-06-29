import { describe, expect, it } from 'vitest';
import { generateId } from './id';

import * as rules from './rules';

/* ========================================================================== */

describe('rules', () => {
	describe('calculateStartingTileBonus', () => {
		it('should return 40 when the tile value is 0 (opening zero bonus)', () => {
			const { calculateStartingTileBonus } = rules;
			expect(calculateStartingTileBonus(0)).toBe(40);
		});

		it('should return 10 for possible triple tile values', () => {
			const { calculateStartingTileBonus } = rules;
			expect(calculateStartingTileBonus(3)).toBe(10);
			expect(calculateStartingTileBonus(9)).toBe(10);
			expect(calculateStartingTileBonus(15)).toBe(10);
		});

		it('should return 0 for tiles which cannot be a triple tile', () => {
			const { calculateStartingTileBonus } = rules;
			expect(calculateStartingTileBonus(7)).toBe(0);
			expect(calculateStartingTileBonus(11)).toBe(0);
			expect(calculateStartingTileBonus(2)).toBe(0);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('calculateTurnScore', () => {
		describe('skipped turns (tilesPlayed: 0)', () => {
			it('should return -10 when no tiles are drawn', () => {
				const { calculateTurnScore } = rules;

				expect(
					calculateTurnScore({ tilesPlayed: 0, tilesDrawn: 0, tileValue: undefined })
				).toBe(-10);
			});

			it('should subtract 5 per tile drawn on top of the skip penalty', () => {
				const { calculateTurnScore } = rules;

				expect(
					calculateTurnScore({ tilesPlayed: 0, tilesDrawn: 1, tileValue: undefined })
				).toBe(-15);
				expect(
					calculateTurnScore({ tilesPlayed: 0, tilesDrawn: 2, tileValue: undefined })
				).toBe(-20);
				expect(
					calculateTurnScore({ tilesPlayed: 0, tilesDrawn: 3, tileValue: undefined })
				).toBe(-25);
			});
		});

		describe('played turns (tilesPlayed: 1)', () => {
			it('should return the tile value when no draws and no bonuses', () => {
				const { calculateTurnScore } = rules;

				expect(calculateTurnScore({
					tilesPlayed: 1, tilesDrawn: 0, tileValue: 15,
					triple: false, bonusBridge: false, bonusDouble: false, bonusHexagon: false
				})).toBe(15);
			});

			it('should subtract 5 per tile drawn', () => {
				const { calculateTurnScore } = rules;

				expect(calculateTurnScore({
					tilesPlayed: 1, tilesDrawn: 1, tileValue: 15,
					triple: false, bonusBridge: false, bonusDouble: false, bonusHexagon: false
				})).toBe(10);

				expect(calculateTurnScore({
					tilesPlayed: 1, tilesDrawn: 3, tileValue: 15,
					triple: false, bonusBridge: false, bonusDouble: false, bonusHexagon: false
				})).toBe(0);
			});

			describe('opening triple bonuses', () => {
				it('should add 40 for a 0-value opening tile', () => {
					const { calculateTurnScore } = rules;

					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 0, tileValue: 0,
						triple: true, bonusBridge: false, bonusDouble: false, bonusHexagon: false
					})).toBe(40);
				});

				it('should add 10 for a non-zero opening tile', () => {
					const { calculateTurnScore } = rules;

					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 0, tileValue: 9,
						triple: true, bonusBridge: false, bonusDouble: false, bonusHexagon: false
					})).toBe(19);
				});

				it('should not apply opening bonus when triple is false', () => {
					const { calculateTurnScore } = rules;

					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 0, tileValue: 9,
						triple: false, bonusBridge: false, bonusDouble: false, bonusHexagon: false
					})).toBe(9);
				});
			});

			describe('special tile bonuses', () => {
				it('should add 40 for a bridge bonus', () => {
					const { calculateTurnScore } = rules;

					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 0, tileValue: 15,
						triple: false, bonusBridge: true, bonusDouble: false, bonusHexagon: false
					})).toBe(55);
				});

				it('should add 40 for a double-sided bonus', () => {
					const { calculateTurnScore } = rules;

					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 0, tileValue: 15,
						triple: false, bonusBridge: false, bonusDouble: true, bonusHexagon: false
					})).toBe(55);
				});

				it('should add 50 for a hexagon bonus', () => {
					const { calculateTurnScore } = rules;

					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 0, tileValue: 15,
						triple: false, bonusBridge: false, bonusDouble: false, bonusHexagon: true
					})).toBe(65);
				});

				it('should stack all three special bonuses', () => {
					const { calculateTurnScore } = rules;

					// 15 + 40 (bridge) + 40 (double) + 50 (hexagon) = 145
					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 0, tileValue: 15,
						triple: false, bonusBridge: true, bonusDouble: true, bonusHexagon: true
					})).toBe(145);
				});

				it('should combine draws and bonuses correctly', () => {
					const { calculateTurnScore } = rules;

					// 15 - 5 (1 draw) + 40 (bridge) = 50
					expect(calculateTurnScore({
						tilesPlayed: 1, tilesDrawn: 1, tileValue: 15,
						triple: false, bonusBridge: true, bonusDouble: false, bonusHexagon: false
					})).toBe(50);
				});
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('canTileBeTriple', () => {
		it('should return true for 0', () => {
			const { canTileBeTriple } = rules;
			expect(canTileBeTriple(0)).toBe(true);
		});

		it('should return true when the tile value is a multiple of 3', () => {
			const { canTileBeTriple } = rules;
			expect(canTileBeTriple(3)).toBe(true);
			expect(canTileBeTriple(9)).toBe(true);
			expect(canTileBeTriple(15)).toBe(true);
		});

		it('should return false when the tile value is not a multiple of 3', () => {
			const { canTileBeTriple } = rules;
			expect(canTileBeTriple(7)).toBe(false);
			expect(canTileBeTriple(11)).toBe(false);
			expect(canTileBeTriple(2)).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('determineRoundWinnerAndPoints', () => {
		describe('blocked rounds (isBlocked: true)', () => {
			it('should pick the player with the fewest leftover points as winner', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();

				const result = determineRoundWinnerAndPoints(
					{ [playerAId]: 5, [playerBId]: 10 },
					true
				);

				expect(result.winnerId).toBe(playerAId);
			});

			it('should award the winner the sum of others\' points minus their own', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();

				// A=5, B=10 → A wins, gets 10 - 5 = 5
				const result = determineRoundWinnerAndPoints(
					{ [playerAId]: 5, [playerBId]: 10 },
					true
				);

				expect(result.points).toBe(5);
			});

			it('should handle three players correctly', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();
				const playerCId = generateId();

				// A=5, B=10, C=15 → A wins, gets 10 + 15 - 5 = 20
				const result = determineRoundWinnerAndPoints(
					{ [playerAId]: 5, [playerBId]: 10, [playerCId]: 15 },
					true
				);

				expect(result.winnerId).toBe(playerAId);
				expect(result.points).toBe(20);
			});

			it('should award 0 points when all players have 0 leftover', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();

				const result = determineRoundWinnerAndPoints(
					{ [playerAId]: 0, [playerBId]: 0 },
					true
				);

				expect(result.points).toBe(0);
			});

			it('should pick the first player in iteration order when leftover points are tied', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();

				// A and B are tied at 5 points each. The reduce initializes
				// with playerIds[0] (A) and only replaces on strict <, so A
				// wins.
				// Points awarded: 5 - 5 = 0.
				const result = determineRoundWinnerAndPoints(
					{ [playerAId]: 5, [playerBId]: 5 },
					true
				);

				expect(result.winnerId).toBe(playerAId);
				expect(result.points).toBe(0);
			});
		});

		describe('won rounds (isBlocked: false)', () => {
			it('should award the winner 25 base points plus all leftover points from other players', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();

				// B=10 leftover, winner A → 25 + 10 = 35
				const result = determineRoundWinnerAndPoints(
					{ [playerBId]: 10 },
					false,
					playerAId
				);

				expect(result.winnerId).toBe(playerAId);
				expect(result.points).toBe(35);
			});

			it('should sum all players\' leftover points', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();
				const playerCId = generateId();

				// B=10, C=20 leftover, winner A → 25 + 10 + 20 = 55
				const result = determineRoundWinnerAndPoints(
					{ [playerBId]: 10, [playerCId]: 20 },
					false,
					playerAId
				);

				expect(result.points).toBe(55);
			});

			it('should award exactly 25 points when all others have 0 leftover', () => {
				const { determineRoundWinnerAndPoints } = rules;
				const playerAId = generateId();
				const playerBId = generateId();
				const playerCId = generateId();

				const result = determineRoundWinnerAndPoints(
					{ [playerBId]: 0, [playerCId]: 0 },
					false,
					playerAId
				);

				expect(result.points).toBe(25);
			});
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('determineTilesPerPlayer', () => {
		it('should return 9 when the number of players is 2', () => {
			const { determineTilesPerPlayer } = rules;
			expect(determineTilesPerPlayer(2)).toBe(9);
		});

		it('should return 7 when the number of players is 3 or 4', () => {
			const { determineTilesPerPlayer } = rules;
			expect(determineTilesPerPlayer(3)).toBe(7);
			expect(determineTilesPerPlayer(4)).toBe(7);
		});

		it('should return 6 when the number of players is 5 or 6', () => {
			const { determineTilesPerPlayer } = rules;
			expect(determineTilesPerPlayer(5)).toBe(6);
			expect(determineTilesPerPlayer(6)).toBe(6);
		});

		it('should return 0 when the number of players is not 2, 3, 4, 5, or 6', () => {
			const { determineTilesPerPlayer } = rules;
			expect(determineTilesPerPlayer(1)).toBe(0);
			expect(determineTilesPerPlayer(7)).toBe(0);
		});
	});
});

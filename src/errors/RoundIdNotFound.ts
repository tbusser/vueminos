import { AppError } from './AppError';

/* ========================================================================== */

/**
 * Custom error class for when a round ID is not found. This error is thrown
 * when an operation requires a round ID but the provided ID does not match
 * any round in the current game.
 */
export class RoundIdNotFoundError extends AppError {
	constructor(message: string) {
		super(message);
	}
}

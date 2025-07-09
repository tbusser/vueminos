import { AppError } from './AppError';

/* ========================================================================== */

/**
 * Custom error class for handling cases where a player ID is not found. This
 * error is thrown when an operation requires a player ID but the provided ID
 * does not match any player for the current game.
 */
export class PlayerIdNotFoundError extends AppError {
	constructor(message: string) {
		super(message);
		this.name = 'PlayerIdNotFoundError';
	}
}

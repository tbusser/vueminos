import { AppError } from './AppError';

/* ========================================================================== */

/**
 * Custom error class for handling cases where a turn ID is not found. This
 * error is thrown when an operation requires a turn ID but the provided ID
 * does not match any turn for the current game.
 */
export class TurnIdNotFoundError extends AppError {
	constructor(message: string) {
		super(message);
	}
}

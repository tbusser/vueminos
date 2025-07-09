import { AppError } from './AppError';

/* ========================================================================== */

/**
 * Custom error class to handle cases where no current round exists. This error
 * is thrown when an operation requires a current round but none is found in the
 * store for the current game.
 */
export class NoCurrentRoundExistsError extends AppError {
	constructor(message = 'No current round present') {
		super(message);
		this.name = 'NoCurrentRoundExistsError';
	}
}

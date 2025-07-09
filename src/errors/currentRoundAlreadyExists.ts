import { AppError } from './AppError';

/* ========================================================================== */

/**
 * Custom error class to indicate that a current round already exists.
 * This error is thrown when an attempt is made to add a new round while
 * a current round is already present in the store.
 */
export class CurrentRoundAlreadyExistsError extends AppError {
	constructor(message = 'A current round already exists.') {
		super(message);
		this.name = 'CurrentRoundAlreadyExistsError';
	}
}

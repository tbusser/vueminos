/**
 * Base class for all application-specific errors.
 */
export class AppError extends Error {
	constructor(message: string) {
		super(message);
		this.name = new.target.name;
	}
}

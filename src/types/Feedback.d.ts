export {};

/* ========================================================================== */

type ErrorFeedback = {
	/**
	 * The message describing the error that occurred.
	 */
	message: string;

	/**
	 * Indicates whether the operation was successful or not.
	 */
	success: false;
};

type SuccessFeedback = {
	/**
	 * Indicates whether the operation was successful or not.
	 */
	success: true;
};

/* ========================================================================== */

declare global {
	type Feedback = ErrorFeedback | SuccessFeedback;
};

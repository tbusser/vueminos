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

type SuccessFeedback<T = void> = {
	/**
	 * Indicates whether the operation was successful or not.
	 */
	success: true;
} & (T extends void ? object : { payload: T });

/* ========================================================================== */

export type Feedback<T = void> = ErrorFeedback | SuccessFeedback<T>;

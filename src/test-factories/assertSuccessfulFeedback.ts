import type { Feedback, SuccessFeedback } from '@/types/Feedback';

/* ========================================================================== */

export function assertSuccessfulFeedback<T, K extends keyof SuccessFeedback<T>>(
	feedback: Feedback<T>, property: K
): SuccessFeedback<T>[K];
export function assertSuccessfulFeedback<T>(feedback: Feedback<T>): SuccessFeedback<T>;
export function assertSuccessfulFeedback<T, K extends keyof SuccessFeedback<T>>(
	feedback: Feedback<T>, property?: K
): SuccessFeedback<T>[K] | SuccessFeedback<T> {
	if (!feedback.success) {
		throw new Error(`Expected successful feedback, got error: ${feedback.message}`);
	}

	if (property === undefined) {
		return feedback as SuccessFeedback<T>;
	}

	return (feedback as SuccessFeedback<T>)[property];
}

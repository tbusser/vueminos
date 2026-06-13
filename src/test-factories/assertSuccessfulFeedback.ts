import type { Feedback } from '@/types/Feedback';

/* ========================================================================== */

export function assertSuccessfulFeedback<T>(feedback: Feedback<T>): T {
	if (!feedback.success) {
		throw new Error(`Expected successful feedback, got error: ${feedback.message}`);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (feedback as any).payload;
}

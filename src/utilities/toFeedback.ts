import { AppError } from '@/errors';

import type { Feedback, SuccessFeedback } from '@/types/Feedback';

/* ========================================================================== */

export function toFeedback<T extends Record<string, unknown> | void = void>(
	fn: () => T, mapError?: (error: AppError) => string
): Feedback<T> {
	try {
		const result = fn();

		return { success: true, ...(result ?? {}) } as SuccessFeedback<T>;
	} catch (error) {
		if (error instanceof AppError) {
			const message = mapError?.(error) ?? error.message;

			return { message, success: false };
		}

		// A non-AppError error means a programming error, not user feedback.
		// Let it surface.
		throw error;
	}
}

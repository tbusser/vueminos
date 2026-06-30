import { describe, expect, it } from 'vitest';
import { toFeedback } from './toFeedback';
import { AppError } from '@/errors';

/* ========================================================================== */

describe('toFeedback', () => {
	it('should return a successful feedback when there is no error', () => {
		const result = toFeedback(() => undefined);
		expect(result).toEqual({ success: true });
	});

	it('should include the result in the successful feedback when it is not void', () => {
		const result = toFeedback(() => ({ value: 'test' }));
		expect(result).toEqual({ success: true, value: 'test' });
	});

	it('should rethrow non-AppError errors', () => {
		expect(() => toFeedback(() => {
			throw new Error('test');
		})).toThrow('test');
	});

	it('should return an error feedback when an AppError is thrown', () => {
		const result = toFeedback(() => {
			throw new AppError('test');
		});
		expect(result).toEqual({ success: false, message: 'test' });
	});

	it('should return an error feedback when an AppError is thrown with a custom message', () => {
		const result = toFeedback(
			() => {
				throw new AppError('test');
			},
			() => 'custom message'
		);
		expect(result).toEqual({ success: false, message: 'custom message' });
	});
});

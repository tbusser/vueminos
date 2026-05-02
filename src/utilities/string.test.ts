import { describe, expect, it } from 'vitest';

import { isNilOrEmptyString } from './string';

/* ========================================================================== */

describe('isNilOrEmptyString', () => {
	describe('returns true for nil values', () => {
		it('returns true for null', () => {
			expect(isNilOrEmptyString(null)).toBe(true);
		});

		it('returns true for undefined', () => {
			expect(isNilOrEmptyString(undefined)).toBe(true);
		});
	});

	describe('returns true for empty or whitespace-only strings', () => {
		it('returns true for an empty string', () => {
			expect(isNilOrEmptyString('')).toBe(true);
		});

		it('returns true for a string with only spaces', () => {
			expect(isNilOrEmptyString('   ')).toBe(true);
		});

		it('returns true for a string with only tabs', () => {
			expect(isNilOrEmptyString('\t\t')).toBe(true);
		});

		it('returns true for a string with mixed whitespace', () => {
			expect(isNilOrEmptyString(' \t \n ')).toBe(true);
		});
	});

	describe('returns false for non-empty values', () => {
		it('returns false for a non-empty string', () => {
			expect(isNilOrEmptyString('hello')).toBe(false);
		});

		it('returns false for a string with leading/trailing whitespace around content', () => {
			expect(isNilOrEmptyString('  hello  ')).toBe(false);
		});

		it('returns false for a number', () => {
			expect(isNilOrEmptyString(42)).toBe(false);
		});

		it('returns false for zero', () => {
			expect(isNilOrEmptyString(0)).toBe(false);
		});

		it('returns false for false', () => {
			expect(isNilOrEmptyString(false)).toBe(false);
		});

		it('returns false for an object', () => {
			expect(isNilOrEmptyString({})).toBe(false);
		});

		it('returns false for an array', () => {
			expect(isNilOrEmptyString([])).toBe(false);
		});
	});
});

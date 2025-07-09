type EmptyString = '' | null | undefined;

/* ========================================================================== */

/**
 * Checks if the provided value is either null, undefined, or an empty string.
 *
 * @param value The value to check.
 *
 * @returns True if the value is null, undefined, or an empty string;
 *          false otherwise.
 */
export function isNilOrEmptyString(value: unknown): value is EmptyString {
	if (value === null) return true;
	if (value === undefined) return true;

	return (typeof value === 'string' && value.trim() === '');
}
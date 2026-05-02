/**
 * Generates a unique identifier.
 *
 * @returns A unique identifier as a string.
 */
export function generateId(): Id {
	return crypto.randomUUID();
}

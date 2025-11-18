export function generateId(): Id {
	/**
	 * Generates a unique identifier.
	 *
	 * @returns A unique identifier as a string.
	 */
	return crypto.randomUUID();
}

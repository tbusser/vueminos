import type { UUID } from 'crypto';

/* ========================================================================== */

export {};

/* ========================================================================== */

declare global {
	type Id = UUID;

	/**
	 * Vite defined constant with the application version.
	 * @example '1.0.0'
	 */
	const __APP_VERSION__: string;

	/**
	 * Vite defined constant with the build timestamp.
	 * @example 1719859200000
	 */
	const __BUILD_TIMESTAMP__: number;
}

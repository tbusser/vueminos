import { vi } from 'vitest';

/* ========================================================================== */

export function createMockGlobalI18n(): void {
	vi.mock('@/i18n', () => ({
		useGlobalI18n: () => ({ t: (key: string) => key })
	}));
}

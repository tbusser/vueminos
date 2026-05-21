import { vi } from 'vitest';

/* ========================================================================== */

export const useGlobalI18n = vi.fn(() => ({ t: (key: string) => key }));

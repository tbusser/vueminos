import { createI18n, useI18n } from 'vue-i18n';

import en from './en.json';
import nl from './nl.json';

/* ========================================================================== */

type MessageSchema = typeof en;

/* ========================================================================== */

export const i18n = createI18n<[MessageSchema], 'en' | 'nl'>({
	fallbackLocale: 'en',
	legacy: false,
	messages: { en, nl }
});

export function useGlobalI18n() {
	return useI18n<[MessageSchema], 'en' | 'nl'>({ useScope: 'global' });
}

import { ref } from 'vue';
import { defineStore } from 'pinia';

import { type Locale } from '@/i18n';

/* ========================================================================== */

export type ColorScheme = 'dark' | 'light';

/* ========================================================================== */

export const useSettingsStore = defineStore('settings', () => {
	/**
	 * The color scheme of the application. This is either 'dark', 'light', or
	 * undefined if no color scheme is set.
	 */
	const colorScheme = ref<ColorScheme | undefined>();

	/**
	 * The locale of the application. This is a string representing the locale,
	 * or undefined if no locale is set.
	 */
	const locale = ref<Locale | undefined>();

	/* ====================================================================== */

	/**
	 * Resets the settings store by clearing the color scheme and locale.
	 */
	function $reset(): void {
		colorScheme.value = undefined;
		locale.value = undefined;
	}

	/**
	 * Sets the color scheme of the application. If no color scheme is provided,
	 * it will default to the system setting.
	 *
	 * @param newTheme The new color scheme to set. This can be 'dark', 'light',
	 *        or undefined to set it to auto.
	 */
	function setColorScheme(newTheme?: ColorScheme): void {
		colorScheme.value = newTheme;
	}

	/**
	 * Sets the locale of the application. If no locale is provided, it will
	 * default to auto..
	 *
	 * @param newLocale The new locale to set. This can be a string representing
	 *        the locale, or undefined to set the locale to auto.
	 */
	function setLocale(newLocale?: Locale): void {
		locale.value = newLocale;
	}

	/* ====================================================================== */

	return {
		// State
		colorScheme,
		locale,

		// Actions
		$reset,
		setLocale,
		setColorScheme
	};
}, {
	persist: {
		storage: localStorage
	}
});

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from './settings';

/* ========================================================================== */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Settings Store', () => {
	describe('setColorScheme', () => {
		it('should set the color scheme to the provided value', () => {
			const settingsStore = useSettingsStore();
			settingsStore.setColorScheme('dark');
			expect(settingsStore.colorScheme).toBe('dark');
		});

		it('should clear the color scheme when called without argument', () => {
			const settingsStore = useSettingsStore();
			settingsStore.setColorScheme('dark');
			settingsStore.setColorScheme();
			expect(settingsStore.colorScheme).toBeUndefined();
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('setLocale', () => {
		it('should set the locale to the provided value', () => {
			const settingsStore = useSettingsStore();
			settingsStore.setLocale('en');
			expect(settingsStore.locale).toBe('en');
		});

		it('should clear the locale when called without argument', () => {
			const settingsStore = useSettingsStore();
			settingsStore.setLocale('en');
			settingsStore.setLocale();
			expect(settingsStore.locale).toBeUndefined();
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('$reset', () => {
		it('should reset the settings store', () => {
			const settingsStore = useSettingsStore();
			settingsStore.setColorScheme('dark');
			settingsStore.setLocale('en');
			settingsStore.$reset();
			expect(settingsStore.colorScheme).toBeUndefined();
			expect(settingsStore.locale).toBeUndefined();
		});
	});
});

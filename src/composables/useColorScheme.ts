import { watch, type MaybeRefOrGetter } from 'vue';
import type { ColorScheme } from '@/stores/settings';

/* ========================================================================== */

export function useColorScheme(scheme: MaybeRefOrGetter<ColorScheme | undefined>) {
	watch(scheme, selectedScheme => {
		document.documentElement.classList.toggle('dark-theme', selectedScheme === 'dark');
		document.documentElement.classList.toggle('light-theme', selectedScheme === 'light');
	}, {
		immediate: true
	});
}

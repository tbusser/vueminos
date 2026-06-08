import { ref } from 'vue';

/* ========================================================================== */

const title = ref<string>('');
const subtitle = ref<string | undefined>(undefined);

/* ========================================================================== */

export function useScreenTitle() {
	return {
		subtitle,
		title
	};
}

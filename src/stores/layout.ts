import { ref } from 'vue';
import { defineStore } from 'pinia';

/* ========================================================================== */

export const useLayoutStore = defineStore('layout', () => {
	/**
	 *
	 */
	const isBottomSheetOpen = ref<boolean>(false);

	/**
	 * The subtitle of the current screen. This can be undefined to clear
	 * the subtitle.
	 */
	const subtitle = ref<string | undefined>(undefined);

	/**
	 * The title of the current screen.
	 */
	const title = ref<string>('');

	/* -- Actions ----------------------------------------------------------- */

	function $reset(): void {
		isBottomSheetOpen.value = false;
		subtitle.value = undefined;
		title.value = '';
	}

	/**
	 * Sets the visibility of the bottom sheet.
	 *
	 * @param value The new visibility of the bottom sheet.
	 */
	function setIsBottomSheetOpen(value: boolean): void {
		isBottomSheetOpen.value = value;
	}

	/**
	 * Sets the subtitle of the current screen.
	 *
	 * @param value The new subtitle to set. This can be undefined to clear
	 *              the subtitle.
	 */
	function setSubtitle(value?: string): void {
		subtitle.value = value;
	}

	/**
	 * Sets the title of the current screen.
	 * @param value The new title to set.
	 */
	function setTitle(value: string): void {
		title.value = value;
	}

	/* -- Public API -------------------------------------------------------- */

	return {
		// State
		isBottomSheetOpen,
		subtitle,
		title,

		// Actions
		$reset,
		setIsBottomSheetOpen,
		setSubtitle,
		setTitle
	};
});

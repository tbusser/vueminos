import { ref } from 'vue';

/* ========================================================================== */

// This is shared state for the bottom sheet composable, all instances will look
// at the same value.
const isBottomSheetOpen = ref<boolean>(false);

/* ========================================================================== */

export function useBottomSheet() {
	return {
		isBottomSheetOpen
	};
}

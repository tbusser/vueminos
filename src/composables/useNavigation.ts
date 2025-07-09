import { useRouter } from 'vue-router';

/* ========================================================================== */

export function useNavigation() {
	const router = useRouter();

	/* ---------------------------------------------------------------------- */

	/**
	 * Handles navigation back to the previous page or home if no
	 * history exists.
	 */
	function safeNavigateBack() {
		if (window.history.state?.back) {
			router.back();
		} else {
			router.replace('/');
		}
	}

	/* ---------------------------------------------------------------------- */

	return {
		safeNavigateBack
	};
}

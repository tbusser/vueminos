import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useLayoutStore } from './layout';

/* ========================================================================== */

beforeEach(() => setActivePinia(createPinia()));

/* -------------------------------------------------------------------------- */

describe('Layout Store', () => {
	describe('isBottomSheetOpen', () => {
		it('should be false by default', () => {
			const layoutStore = useLayoutStore();
			expect(layoutStore.isBottomSheetOpen).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('subtitle', () => {
		it('should be undefined by default', () => {
			const layoutStore = useLayoutStore();
			expect(layoutStore.subtitle).toBeUndefined();
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('title', () => {
		it('should be an empty string by default', () => {
			const layoutStore = useLayoutStore();
			expect(layoutStore.title).toBe('');
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('setIsBottomSheetOpen', () => {
		it('should set the visibility of the bottom sheet', () => {
			const layoutStore = useLayoutStore();
			layoutStore.setIsBottomSheetOpen(true);
			expect(layoutStore.isBottomSheetOpen).toBe(true);

			layoutStore.setIsBottomSheetOpen(false);
			expect(layoutStore.isBottomSheetOpen).toBe(false);
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('setSubtitle', () => {
		it('should set the subtitle', () => {
			const layoutStore = useLayoutStore();
			layoutStore.setSubtitle('Subtitle');
			expect(layoutStore.subtitle).toBe('Subtitle');
		});

		it('should clear the subtitle when called without argument', () => {
			const layoutStore = useLayoutStore();
			layoutStore.setSubtitle('Subtitle');
			layoutStore.setSubtitle();
			expect(layoutStore.subtitle).toBeUndefined();
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('setTitle', () => {
		it('should set the title', () => {
			const layoutStore = useLayoutStore();
			layoutStore.setTitle('Title');
			expect(layoutStore.title).toBe('Title');
		});
	});

	/* ---------------------------------------------------------------------- */

	describe('$reset', () => {
		it('should reset the layout store', () => {
			const layoutStore = useLayoutStore();
			layoutStore.setIsBottomSheetOpen(true);
			layoutStore.setSubtitle('Subtitle');
			layoutStore.setTitle('Title');

			layoutStore.$reset();

			expect(layoutStore.isBottomSheetOpen).toBe(false);
			expect(layoutStore.subtitle).toBeUndefined();
			expect(layoutStore.title).toBe('');
		});
	});
});

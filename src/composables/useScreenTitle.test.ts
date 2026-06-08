import { describe, expect, it } from 'vitest';
import { useScreenTitle } from './useScreenTitle';

/* ========================================================================== */

describe('useScreenTitle', () => {
	it('should return the same title over multiple instances', () => {
		const instanceA = useScreenTitle();
		const instanceB = useScreenTitle();

		const title = 'Title A';
		instanceA.title.value = title;

		expect(instanceB.title.value).toBe(title);
	});
});

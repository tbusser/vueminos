import { getActivePinia } from 'pinia';

/* ========================================================================== */

export function assertActivePinia(name: string): void {
	if (!getActivePinia()) {
		throw new Error(
			`${name} requires an active Pinia — call setActivePinia(createPinia()) in beforeEach`
		);
	}
}

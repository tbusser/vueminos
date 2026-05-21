import { getActivePinia } from 'pinia';

/* ========================================================================== */

export function assertActivePinia(name: string): void {
	if (getActivePinia() === undefined) {
		throw new Error(`${name} requires an active Pinia instance`);
	}
}

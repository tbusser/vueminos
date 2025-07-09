/*
 |------------------------------------------------------------------------------
 | useSlot
 |------------------------------------------------------------------------------
 |
 | Code has been adapted from:
 | https://www.telerik.com/blogs/checking-vue-3-slots-emptiness
 |
 |*/

import { Comment, computed, Fragment, isVNode, type Slot, type VNodeArrayChildren } from 'vue';

/* ========================================================================== */

function vNodeIsEmpty(vNodes: VNodeArrayChildren): boolean {
	return vNodes.every((vNode) => {
		if (!isVNode(vNode)) return true;
		if (vNode.type === Comment) return true;
		if (vNode.type === Text && !(vNode.children as string)?.trim()) return true;
		if (vNode.type === Fragment && vNodeIsEmpty(vNode.children as VNodeArrayChildren)) return true;

		return false;
	});
}

function isEmptySlot(slot: Slot): boolean {
	if (!slot) return true;
	if (typeof slot !== 'function') return true;

	return vNodeIsEmpty(slot());
}

/* ========================================================================== */

export function useSlot(slot: Slot) {
	const isEmpty = computed<boolean>(() => isEmptySlot(slot));

	/* ---------------------------------------------------------------------- */

	return {
		isEmpty
	};
}

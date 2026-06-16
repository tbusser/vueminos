<script setup lang="ts">
import { onUnmounted, toRef, watch } from 'vue';

import { useLayoutStore } from '@/stores/layout';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'close'): void;
}>();

const props = defineProps<{
	/**
	 * Controls the visibility of the BottomSheet component. If set to true,
	 * the BottomSheet will be displayed; if false, it will be hidden.
	 */
	open?: boolean;
}>();

/* -------------------------------------------------------------------------- */

const layoutStore = useLayoutStore();
const { setIsBottomSheetOpen } = layoutStore;

const isOpen = toRef(props, 'open');

/* -------------------------------------------------------------------------- */

watch(isOpen, value => {
	setIsBottomSheetOpen(value);

	if (value) {
		addEventListenersToDocument();
	} else {
		removeEventListenersFromDocument();
	}
});

/* -------------------------------------------------------------------------- */

// Reset global ref on unmount; the close handler won't fire when the parent
// component is torn down while the sheet is open, leaving the
// app un-scrollable.
onUnmounted(() => setIsBottomSheetOpen(false));

/* -------------------------------------------------------------------------- */

function addEventListenersToDocument(): void {
	document.addEventListener('keydown', onKeyDown);
}

function removeEventListenersFromDocument(): void {
	document.removeEventListener('keydown', onKeyDown);
}

/* -------------------------------------------------------------------------- */

onUnmounted(removeEventListenersFromDocument);

/* -------------------------------------------------------------------------- */

function onClose(): void {
	emit('close');
}

function onKeyDown(event: KeyboardEvent): void {
	if (event.key === 'Escape') {
		onClose();

		return;
	}
}
</script>

<template>
	<Teleport to="body">
		<transition name="slide-in">
			<div
				v-if="open"
				class="sheet"
				role="dialog"
				aria-modal="true"
			>
				<div class="content-container">
					<slot name="header" />
					<div class="scroll-container">
						<div class="slot-wrapper">
							<slot />
						</div>
					</div>
					<slot name="footer" />
				</div>
			</div>
		</transition>
	</Teleport>
</template>

<style lang="scss" scoped>
.slide-in-enter-active,
.slide-in-leave-active {
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
}
.slide-in-enter-from,
.slide-in-leave-to {
	transform: translateY(50%);
	opacity: 0;
}
.slide-in-enter-to,
.slide-in-leave-from {
	transform: translateY(0%);
	opacity: 1;
}

.content-container {
	background-color: var(--color-background);
	border-top-left-radius: get-spacing(small);
	border-top-right-radius: get-spacing(small);
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 1px;
}

.scroll-container {
	flex-grow: 1;
	overflow-y: auto;
}

.slot-wrapper {
	display: flex;
	flex: 1 0;
	flex-direction: column;
	gap: get-spacing();
	padding: get-spacing();
	overflow-y: auto;
}

.sheet {
	bottom: 0;
	display: flex;
	gap: get-spacing(x-small);
	flex-direction: column;
	left: 0;
	height: 95dvh;
	position: fixed;
	right: 0;
	z-index: 1000; /* Ensure it appears above other content */
}
</style>

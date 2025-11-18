<script setup lang="ts">
import { onUnmounted, watch } from 'vue';

import { useBottomSheet } from '@/composables/useBottomSheet';

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

const { isBottomSheetOpen } = useBottomSheet();

/* -------------------------------------------------------------------------- */

watch(() => props.open, isOpen => {
	isBottomSheetOpen.value = isOpen;

	if (isOpen) {
		addEventListenersToDocument();
	} else {
		removeEventListenersFromDocument();
	}
});

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
		<div v-if="open" class="sheet" role="dialog" aria-modal="true">
			<!-- <button type="button" class="close-button" @click="onClose">
				X
			</button> -->
			<div class="content-container">
				<slot name="header" />
				<div class="scroll-container">
					<div class="slot-wrapper">
						<slot />
					</div>
				</div>
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

.backdrop {
	background-color: rgba(0, 0, 0, 0.5);
	bottom: 0;
	height: 100%;
	left: 0;
	position: fixed;
	right: 0;
	top: 0;
	z-index: 999; /* Ensure it appears above other content */
}

.close-button {
	align-self: flex-end;
	aspect-ratio: 1 / 1;
	border-radius: 50%;
	margin-right: get-spacing();
	position: relative;
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

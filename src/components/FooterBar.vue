<script setup lang="ts">
import { useSlot } from '@/composables/useSlot';
import { computed } from 'vue';

const slots = defineSlots<{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	primary(): any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	secondary(): any;
}>();

/* -------------------------------------------------------------------------- */

const { isEmpty: isPrimarySlotEmpty } = useSlot(slots.primary);
const { isEmpty: isSecondarySlotEmpty } = useSlot(slots.secondary);

const hasSlottedContent = computed<boolean>(() =>
	!isPrimarySlotEmpty.value || !isSecondarySlotEmpty.value
);
</script>

<template>
	<nav
		v-if="hasSlottedContent"
		class="footer-bar"
	>
		<div class="container secondary">
			<slot name="secondary" />
		</div>
		<div class="container primary">
			<slot name="primary" />
		</div>
	</nav>
</template>

<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: row;
	gap: get-spacing(x-small);
}

.footer-bar {
	display: grid;
	grid-template-columns: max-content auto max-content;
	grid-template-areas: 'secondary . primary';
	padding: get-spacing() get-spacing();
	position: relative;

	&::before {
		background-color: var(--color-border);
		content: '';
		display: block;
		height: 2px;
		left: get-spacing(x-small);
		position: absolute;
		right: get-spacing(x-small);
		top: 0;
	}
}

.primary {
	grid-area: primary;
}

.secondary {
	grid-area: secondary;
}
</style>

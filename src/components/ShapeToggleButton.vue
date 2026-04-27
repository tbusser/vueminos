<script setup lang="ts">
import { computed, inject } from 'vue';

import { toggleGroupInjectionKey } from '@/components/ToggleButtonGroup.vue';

/* ========================================================================== */

const emits = defineEmits<{
	(e: 'toggle', value: boolean): void;
}>();

const props = defineProps<{
	/**
	 * Indicates whether the button is disabled or not. If the button is part of
	 * a group and the group is disabled, this prop will be ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean;

	/**
	 * Indicates whether the button is selected or not. If the button is part of
	 * a group and the button has an ID, this prop will be ignored.
	 *
	 * @default false
	 */
	isSelected?: boolean;

	/**
	 * The ID of the button. If the button is part of a group, this prop is
	 * required.
	 */
	id?: string;
}>();

const useToggleGroup = inject(toggleGroupInjectionKey, null);

/* -------------------------------------------------------------------------- */

const disabled = computed<boolean>(() => useToggleGroup?.isDisabled.value || props.isDisabled);
const selected = computed<boolean>(() => {
	return (useToggleGroup === null || props.id === undefined)
		? props.isSelected
		: useToggleGroup.selectedIds.value.includes(props.id);
});

/* -------------------------------------------------------------------------- */

function onClick() {
	if (useToggleGroup === null) {
		emits('toggle', !props.isSelected);

		return;
	}

	if (!props.id) return;

	useToggleGroup.setValue(props.id);
}
</script>

<template>
	<button
		role="radio"
		:aria-checked="isSelected"
		:disabled
		class="toggle-button"
		:class="{ 'selected': selected }"
		@click="onClick"
	>
		<slot />
	</button>
</template>

<style lang="scss" scoped>
$checkbox-size: 20px;

/* -------------------------------------------------------------------------- */

.toggle-button {
	border: 1px solid transparent;
	display: flex;
	flex: 1 1 0;
	flex-direction: column;
	gap: get-spacing(xx-small);
	padding: get-spacing(x-small) get-spacing();
	position: relative;

	&.selected {
		background-color: var(--input-background-color);
		border-color: var(--input-border-color);
	}
}

.label {
	text-align: left;
}
</style>

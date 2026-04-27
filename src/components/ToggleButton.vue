<script setup lang="ts">
import { computed, inject } from 'vue';

import { toggleGroupInjectionKey } from '@/components/ToggleButtonGroup.vue';

/* ========================================================================== */

const emits = defineEmits<{
	(e: 'toggle', value: boolean): void;
}>();

const props = defineProps<{
	/**
	 * Indicates whether the text should wrap or not. When the next is not
	 * allowed to wrap, the text will be truncated with an ellipsis.
	 *
	 * @default false
	 */
	allowWrap?: boolean;

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
		<div
			class="label"
			:class="{ 'truncated': !allowWrap }"
		>
			<slot />
		</div>
	</button>
</template>

<style lang="scss" scoped>
$checkbox-size: 20px;

/* -------------------------------------------------------------------------- */

.toggle-button {
	justify-content: flex-start;
	padding: get-spacing(x-small) get-spacing();
	position: relative;

	&::before {
		border: 1px solid var(--input-border-color);
		content: '';
		flex-shrink: 0;
		height: $checkbox-size;
		width: $checkbox-size;
	}

	&.selected {
		background-color: var(--input-background-color);

		&::after {
			content: '✔';
			font-size: .75em;
			left: get-spacing();
			position: absolute;
			text-align: center;
			width: $checkbox-size;
		}
	}
}

.label {
	text-align: left;

	&.truncated {
		@include truncate-text;
	}
}
</style>

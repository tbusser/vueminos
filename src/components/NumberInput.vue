<script setup lang="ts">
import NumberPad, { type KeyValue } from '@/components/NumberPad.vue';

/* ========================================================================== */

const model = defineModel<number | undefined>();

defineProps<{
	/**
	 * Optional prop to toggle the visibility of the clear button. By default,
	 * it is not shown.
	 */
	showClear?: boolean;
}>();

/* -------------------------------------------------------------------------- */

function appendNumber(value: number) {
	model.value = ((model.value ?? 0) * 10) + value;
}

function handleBackspace() {
	if (model.value === undefined) return;

	if (model.value < 10) {
		model.value = undefined;
		return;
	}

	model.value = Math.floor(model.value / 10);
}

/* -------------------------------------------------------------------------- */

function onInput(value: KeyValue) {
	if (value === 'backspace') {
		handleBackspace();
	} else if (value === 'clear') {
		model.value = undefined;
	} else {
		appendNumber(value);
	}
}
</script>

<template>
	<NumberPad
		:show-clear="showClear"
		@input="onInput"
	/>
</template>

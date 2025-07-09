<script lang="ts" setup>
// https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
// https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/examples/datepicker-spinbuttons/
import { computed, ref, watch } from 'vue';

const model = defineModel<number>();

const props = withDefaults(defineProps<{
	/**
	 * The highest value the spinner can have.
	 */
	max?: number;

	/**
	 * The lowest value the spinner can have.
	 */
	min?: number;
}>(), {
	max: Infinity,
	min: 0
});

/* ========================================================================== */

const value = ref<number>(0);
const canDecrease = computed<boolean>(() => (value.value ?? 0) > props.min);
const canIncrease = computed<boolean>(() => (value.value ?? 0) < props.max);

watch(model, newValue => {
	value.value = clampValue(newValue);
}, { immediate: true });

/* -------------------------------------------------------------------------- */

function clampValue(value: number | undefined): number {
	if (value === undefined) return props.min;

	if (value < props.min) return props.min;
	if (value > props.max) return props.max;

	return value;
}

/* -------------------------------------------------------------------------- */

function onDecrease() {
	if (!canDecrease.value) return;

	model.value = value.value - 1;
}

function onIncrease() {
	if (!canIncrease.value) return;

	model.value = value.value + 1;
}

function onKeyDown(event: KeyboardEvent) {
	let cancelEvent = false;

	if (event.key === 'ArrowUp') {
		onIncrease();
	} else if (event.key === 'ArrowDown') {
		onDecrease();
	} else if (event.key === 'Home') {
		cancelEvent = true;
		model.value = props.min;
	} else if (event.key === 'End') {
		cancelEvent = true;
		model.value = props.max;
	}

	if (cancelEvent) {
		event.preventDefault();
		event.stopPropagation();
	}
}
</script>

<template>
	<div class="wrapper" @keydown="onKeyDown">
		<button
			type="button"
			class="button"
			@click="onDecrease"
			:disabled="!canDecrease"
			:aria-label="$t('common.decrease')"
			tabindex="-1"
		>
			<span aria-hidden="true" class="button-label">-</span>
		</button>

		<span
			:aria-valuemax="props.max"
			:aria-valuemin="props.min"
			:aria-valuenow="value"
			:aria-valuetext="value.toString()"
			aria-label="tiles drawn"
			role="spinbutton"
			tabindex="0"
			class="value"
		>
			{{ value }}
		</span>

		<button
			type="button"
			class="button"
			@click="onIncrease"
			:disabled="!canIncrease"
			:aria-label="$t('common.increase')"
			tabindex="-1"
		>
			<span aria-hidden="true" class="button-label">+</span>
		</button>
	</div>
</template>

<style scoped lang="scss">
.button {
	aspect-ratio: 1 / 1;
	border-radius: 50%;
}

.value {
	text-align: center;
	width: 2ch;
}

.wrapper {
	align-items: center;
	display: inline-flex;
	font-size: 1.25em;
	gap: get-spacing(x-small);
	touch-action: manipulation;

	&:focus-within {
		background-color: var(--input-background-color);
		border-radius: 1.25em;
		outline: 1px solid var(--input-border-color-hover);
	}
}
</style>

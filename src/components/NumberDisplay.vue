<script setup lang="ts">
import { computed } from 'vue';

/* ========================================================================== */

const props = withDefaults(defineProps<{
	/**
	 * Optional placeholder text to display when the value is undefined. By
	 * default, this is '---'.
	 *
	 * @example '---'
	 */
	placeholder?: string;

	/**
	 * The value to display.
	 */
	value: number | undefined;
}>(), {
	placeholder: '---'
});

/* -------------------------------------------------------------------------- */

const displayValue = computed<string>(() => {
	return props.value === undefined
		? props.placeholder
		: props.value.toString();
});
</script>

<template>
	<div class="display" aria-live="polite" aria-atomic="true">
		{{ displayValue }}
	</div>
</template>

<style scoped lang="scss">
.display {
	@include truncate-text;

	font-size: 3em;
	font-variant: tabular-nums;
	letter-spacing: 0.25em;
	line-height: 1;

	text-indent: 0.25em;
	text-align: center;
}
</style>

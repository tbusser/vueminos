<script setup lang="ts">
export type SelectOption = {
	/**
	 * Optional prop to disable the option.
	 */
	disabled?: boolean;

	/**
	 * The label of the option.
	 */
	label: string;

	/**
	 * The value of the option.
	 */
	value: string | number | boolean | undefined;
};

/* ========================================================================== */

const model = defineModel();

defineProps<{
	/**
	 * Optional prop to disable to input element.
	 */
	disabled?: boolean;

	/**
	 * Optional prop to visually hide the label. The label will be available for
	 * accessibility purposes.
	 */
	hideLabel?: boolean;

	/**
	 * An ID, unique for the page, to identify the input element.
	 */
	id: string;

	/**
	 * An array of options to be displayed in the select element.
	 */
	options: SelectOption[];

	/**
	 * Optional prop to set the placeholder text for the input element.
	 */
	placeholder?: string;
}>();

</script>

<template>
	<div class="wrapper">
		<label :for="id" :class="{ 'visually-hidden': hideLabel }">
			<slot />
		</label>

		<div class="input-wrapper" :class="{ 'is-disabled': disabled }">
			<select
				:id="id"
				:disabled="disabled"
				v-model="model"
				class="select"
			>
				<template v-for="option in options" :key="option.value">
					<option :value="option.value" :disabled="option.disabled" :selected="option.value === model">
						{{ option.label }}
					</option>
				</template>
			</select>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.select {
	width: 100%;
}
</style>

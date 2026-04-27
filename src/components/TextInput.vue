<script lang="ts" setup>
const model = defineModel<string | undefined>();

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
	 * Optional prop to set the placeholder text for the input element.
	 */
	placeholder?: string;
}>();
</script>

<template>
	<div class="wrapper">
		<label
			:for="id"
			:class="{ 'visually-hidden': hideLabel }"
		>
			<slot />
		</label>

		<div
			class="input-wrapper"
			:class="{ 'is-disabled': disabled }"
		>
			<input
				:id="id"
				v-model="model"
				:disabled="disabled"
				:placeholder="placeholder"
				class="input"
				type="text"
			>
			<slot name="after-input" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.input {
	background: none;
	border: none;
	outline: none;
	width: 100%;

	&:focus,
	&:hover {
		border: none;
	}
}

.input-wrapper {
	align-items: stretch;
	background-color: var(--input-background-color);
	border: 1px solid var(--input-border-color);
	display: flex;
	width: 100%;

	&:not(.is-disabled) {
		&:has(:focus),
		&:hover {
			border: 1px solid var(--input-border-color-hover);
		}
	}

	&.is-disabled {
		opacity: 0.5;
	}
}

.wrapper {
	width: 100%;
}
</style>

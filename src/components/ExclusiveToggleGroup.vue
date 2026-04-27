<script setup lang="ts">
export type ToggleOption = {
	id: string;
	label: string;
	value: string;
};

/* ========================================================================== */

const emits = defineEmits<{
	(event: 'update:modelValue', value: string | undefined): void;
}>();

const props = withDefaults(defineProps<{
	options: ToggleOption[],

	modelValue: string | undefined,

	tag?: string;
}>(), {
	tag: 'div'
});

function onToggleChecked(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.checked) {
		emits('update:modelValue', target.value);
	} else {
		emits('update:modelValue', undefined);
	}
}
</script>

<template>
	<template
		v-for="option in options"
		:key="option.id"
	>
		<input
			:id="option.id"
			type="checkbox"
			name="exclusive-toggle-group"
			:value="option.value"
			:checked="props.modelValue === option.value"
			class="visually-hidden"
			@input="onToggleChecked"
		>
	</template>
	<component
		:is="props.tag"
		class="toggle-group"
	>
		<template
			v-for="option in options"
			:key="option.id"
		>
			<slot :option="{ ...option, checked: props.modelValue === option.value}">
				<label
					:for="option.id"
					class="label"
					:class="{ selected: props.modelValue === option.value }"
				>
					<span>
						{{ option.label }}
					</span>
				</label>
			</slot>
		</template>
	</component>
</template>

<style scoped lang="scss">
$checkbox-size: 20px;

/* -------------------------------------------------------------------------- */

.label {
	align-items: center;
	// border: 1px solid var(--input-border-color);
	display: flex;
	gap: get-spacing(x-small);
	padding: get-spacing(x-small) get-spacing();
	position: relative;
	touch-action: manipulation;

	&::before {
		border: 1px solid var(--input-border-color);
		content: '';
		height: $checkbox-size;
		width: $checkbox-size;
	}

	span {
		@include truncate-text;
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

.toggle-group {
	display: flex;
	flex-direction: var(--exclusive-toggle-group_direction, column);
	gap: var(--exclusive-toggle-group_direction, #{get-spacing(x-small)});
}
</style>

<script lang="ts">
import { type InjectionKey, type Ref } from 'vue';

/* ========================================================================== */

type UseToggleGroup = {
	/**
	 * Indicates if the whole toggle group is disabled.
	 */
	isDisabled: ComputedRef<boolean>;

	selectedIds: Readonly<Ref<string[]>>;

	/**
	 * Method to set the value of the toggle group. If the value is already
	 * selected, it will be deselected.
	 *
	 * @param value The value to set.
	 */
	setValue: (value: string) => void;
};

/* ========================================================================== */

export const toggleGroupInjectionKey = Symbol('toggleGroup') as InjectionKey<UseToggleGroup>;
</script>

<script setup lang="ts">
import { computed, provide, type ComputedRef } from 'vue';

/* ========================================================================== */

const props = withDefaults(defineProps<{
	isDisabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	multiple?: boolean;
}>(), {
	isDisabled: false,
	orientation: 'horizontal',
	multiple: false
});

/* ========================================================================== */

const model = defineModel<string | string[] | undefined>();

/* -------------------------------------------------------------------------- */

function setSingleValue(value: string) {
	if (model.value === value) {
		model.value = undefined;
	} else {
		model.value = value;
	}
}

function setMultipleValue(value: string) {
	if (model.value === undefined) {
		model.value = [value];

		return;
	}

	const arrayModel = Array.isArray(model.value) ? model.value : [model.value];
	model.value = (arrayModel.includes(value))
		? arrayModel.filter((item) => item !== value)
		: [...arrayModel, value];
}

/* -------------------------------------------------------------------------- */

provide(toggleGroupInjectionKey, {
	isDisabled: computed<boolean>(() => props.isDisabled),

	selectedIds: computed<string[]>(() => {
		if (Array.isArray(model.value)) return model.value;
		if (model.value === undefined) return [];

		return [model.value];
	}),

	setValue: (value: string) => {
		if (props.multiple) {
			setMultipleValue(value);
		} else {
			setSingleValue(value);
		}
	}
});
</script>

<template>
	<div class="toggle-button-group" :class="{ 'is-vertical': orientation === 'vertical'}" role="radiogroup">
		<slot />
	</div>
</template>

<style lang="scss" scoped>
.toggle-button-group {
	display: flex;
	gap: get-spacing(x-small);

	&.is-vertical {
		flex-direction: column;
	}
}
</style>

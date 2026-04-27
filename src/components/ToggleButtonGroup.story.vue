<script setup lang="ts">
import { reactive } from 'vue';

import ToggleButton from './ToggleButton.vue';
import ToggleButtonGroup, { type ToggleButtonGroupOrientation } from './ToggleButtonGroup.vue';

/* ========================================================================== */

const state = reactive<{
	isDisabled: boolean;
	orientation: ToggleButtonGroupOrientation;
	value: string | string[] | undefined;
}>({
	isDisabled: false,
	orientation: 'horizontal',
	value: undefined
});
</script>

<template>
	<Story title="Toggle Button Group">
		<Variant title="Default">
			<ToggleButtonGroup
				v-model="state.value"
				:orientation="state.orientation"
			>
				<ToggleButton id="option-1">
					Option 1
				</ToggleButton>
				<ToggleButton id="option-2">
					Option 2
				</ToggleButton>
				<ToggleButton id="option-3">
					Option 3
				</ToggleButton>
			</ToggleButtonGroup>
		</Variant>

		<Variant title="Multiple">
			<ToggleButtonGroup
				v-model="state.value"
				:orientation="state.orientation"
				multiple
			>
				<ToggleButton id="option-1">
					Option 1
				</ToggleButton>
				<ToggleButton id="option-2">
					Option 2
				</ToggleButton>
				<ToggleButton id="option-3">
					Option 3
				</ToggleButton>
			</ToggleButtonGroup>
		</Variant>
	</Story>
</template>

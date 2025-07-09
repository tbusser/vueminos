<script setup lang="ts">
import { reactive } from 'vue';

import ToggleButton from './ToggleButton.vue';
import ToggleButtonGroup from './ToggleButtonGroup.vue';

/* ========================================================================== */

const state = reactive({
	isDisabled: false,
	orientation: 'horizontal',
	value: undefined
});
</script>

<template>
	<Story title="Toggle Button Group">
		<Variant title="Default">
			<ToggleButtonGroup
				:orientation="state.orientation"
				v-model="state.value"
			>
				<ToggleButton id="option-1">Option 1</ToggleButton>
				<ToggleButton id="option-2">Option 2</ToggleButton>
				<ToggleButton id="option-3">Option 3</ToggleButton>
			</ToggleButtonGroup>
		</Variant>

		<Variant title="Multiple">
			<ToggleButtonGroup
				:orientation="state.orientation"
				multiple
				v-model="state.value"
			>
				<ToggleButton id="option-1">Option 1</ToggleButton>
				<ToggleButton id="option-2">Option 2</ToggleButton>
				<ToggleButton id="option-3">Option 3</ToggleButton>
			</ToggleButtonGroup>
		</Variant>
	</Story>
</template>

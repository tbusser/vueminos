<script setup lang="ts">
import { reactive } from 'vue';
import ToggleButton from './ToggleButton.vue';

/* ========================================================================== */

const state = reactive({
	isDisabled: false,
	isSelected: false
});

function onToggle(value: boolean) {
	state.isSelected = value;
}
</script>

<template>
	<Story title="Toggle Button">
		<ToggleButton
			:is-disabled="state.isDisabled"
			:is-selected="state.isSelected"
			@toggle="onToggle"
		>
			Toggle Me
		</ToggleButton>
	</Story>
</template>

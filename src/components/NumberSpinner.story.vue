<script setup lang="ts">
import { reactive } from 'vue';
import NumberSpinner from './NumberSpinner.vue';

/* ========================================================================== */

const state = reactive({
	min: 0,
	max: 10,
	valueLabel: 'Number of tiles drawn'
});
</script>

<template>
	<Story title="Number Spinner">
		<div style="padding: 5px">
			<NumberSpinner
				:min="state.min"
				:max="state.max"
				:value-label="state.valueLabel"
			/>
		</div>
	</Story>
</template>

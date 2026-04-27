<script setup lang="ts">
import { reactive } from 'vue';
import NumberSpinner from './NumberSpinner.vue';

/* ========================================================================== */

const state = reactive({
	min: 0,
	max: 10
});

</script>

<template>
	<Story title="Number Spinner">
		<div style="padding: 5px">
			<NumberSpinner
				:min="state.min"
				:max="state.max"
			/>
		</div>
	</Story>
</template>

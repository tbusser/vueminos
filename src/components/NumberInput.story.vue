<script setup lang="ts">
import { reactive } from 'vue';
import NumberInput from './NumberInput.vue';

/* ========================================================================== */

const state = reactive({
	value: 0
});
</script>

<template>
	<Story title="Number Input">
		<NumberInput v-model="state.value" />
	</Story>
</template>
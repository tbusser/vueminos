<script setup lang="ts">
import { reactive } from 'vue';
import SelectField from './SelectField.vue';

/* ========================================================================== */

const state = reactive({
	hideLabel: false,
	text: ''
});
</script>

<template>
	<Story title="Select Field">
		<SelectField
			id="test"
			placeholder="This is the placeholder"
			v-model="state.text"
			:hide-label="state.hideLabel"
			:options="[]"
		>
			This is the label
		</SelectField>
	</Story>
</template>

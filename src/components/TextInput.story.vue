<script setup lang="ts">
import { reactive } from 'vue';
import TextInput from './TextInput.vue';

/* ========================================================================== */

const state = reactive({
	hideLabel: false,
	text: ''
});
</script>

<template>
	<Story title="Text Input">
		<TextInput
			id="test"
			placeholder="This is the placeholder"
			v-model="state.text"
			:hide-label="state.hideLabel"
		>
			This is the label
			<template #after-input>
				<button>Button</button>
			</template>
		</TextInput>
	</Story>
</template>

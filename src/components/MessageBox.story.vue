<script setup lang="ts">
import { reactive } from 'vue';
import MessageBox, { type MessageBoxType } from './MessageBox.vue';

/* ========================================================================== */

const state = reactive<{
	content: string;
	type: MessageBoxType;
}>({
	content: 'This is the content',
	type: 'info'
});
</script>

<template>
	<Story title="Components/Message Box">
		<template #controls>
			<HstText
				v-model="state.content"
				title="Content"
				placeholder="Enter message"
			/>

			<HstSelect
				v-model="state.type"
				:options="{
					'info': 'Info',
					'warning': 'Warning',
				}"
				title="Type"
				placeholder="Select type"
			/>
		</template>

		<MessageBox :type="state.type">
			{{ state.content }}
		</MessageBox>
	</Story>
</template>

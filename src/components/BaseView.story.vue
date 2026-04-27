<script setup lang="ts">
import { reactive } from 'vue';

/* ========================================================================== */

const state = reactive({
	subtitle: '',
	title: 'Title'
});
</script>

<template>
	<Story title="Base/View">
		<BaseScreen :subtitle="state.subtitle" :title="state.title">
			<div>
				This is the slot content.
			</div>

			<template #primary-action>
				<div>Primary 1</div>
				<div>Primary 2</div>
			</template>
		</BaseScreen>
	</Story>
</template>

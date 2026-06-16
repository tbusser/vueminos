<script setup lang="ts">
import { watch } from 'vue';

import FooterBar from '@/components/FooterBar.vue';
import { useLayoutStore } from '@/stores/layout';

/* ========================================================================== */

const props = defineProps<{
	subtitle?: string;
	title: string;
}>();

/* -------------------------------------------------------------------------- */

const layoutStore = useLayoutStore();
const { setSubtitle, setTitle } = layoutStore;

watch(
	() => props.subtitle,
	value => setSubtitle(value),
	{ immediate: true }
);
watch(
	() => props.title,
	value => setTitle(value),
	{ immediate: true }
);
</script>

<template>
	<article class="base-screen">
		<div class="content">
			<slot />
		</div>

		<FooterBar>
			<template #primary>
				<slot name="primary-action" />
			</template>

			<template #secondary>
				<slot name="secondary-action" />
			</template>
		</FooterBar>
	</article>
</template>

<style lang="scss" scoped>
.base-screen {
	display: grid;
	grid-template-areas:
		'content'
		'footer';
	grid-template-rows: 1fr max-content;
	height: 100%;
	overflow-x: hidden;
	position: relative;
	width: 100vw;
}

.content {
	display: flex;
	flex: 1 1;
	flex-direction: column;
	gap: get-spacing(large);
	grid-area: content;
	overflow-x: hidden;
	overflow-y: scroll;
	position: relative;
	padding: get-spacing();

	&>* {
		flex-shrink: 0;
	}
}

.header {
	grid-area: header;
}
</style>

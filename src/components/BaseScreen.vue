<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import FooterBar from '@/components/FooterBar.vue';

/* ========================================================================== */

const props = defineProps<{
	title: string;
}>();
</script>

<template>
	<article class="base-screen">
		<HeaderBar
			:title="props.title"
			class="header"
		>
			<template #subtitle>
				<slot name="subtitle" />
			</template>

			<template #beforeTitle>
				<slot name="before-title" />
			</template>

			<template #afterTitle>
				<slot name="after-title" />
			</template>
		</HeaderBar>

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
	background-color: var(--color-background);
	display: grid;
	grid-template-areas:
		'header'
		'content'
		'footer';
	grid-template-rows: max-content auto max-content;
	height: 100dvh;
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

.footer {
	display: flex;
	grid-area: footer;
	justify-content: space-between;
}
</style>

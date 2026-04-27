<script setup lang="ts">

import { useSlot } from '@/composables/useSlot';

/* ========================================================================== */

const props = defineProps<{
	subtitle?: string;
	title: string;
}>();

const slots = defineSlots<{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	'after-title'?: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	'before-title'?: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	subtitle(): any;
}>();

/* -------------------------------------------------------------------------- */

const { isEmpty: subtitleIsMissing } = useSlot(slots.subtitle);

// const hasSubtitle = computed(() => (props.subtitle ?? '').trim() !== '');
</script>

<template>
	<header class="header" :class="{ 'has-subtitle': !subtitleIsMissing }">
		<slot name="before-title" />

		<div class="title-wrapper">
			<h1 class="title">{{ props.title }}</h1>
			<div class="subtitle" v-if="!subtitleIsMissing">
				<slot name="subtitle" />
			</div>
		</div>

		<slot name="after-title" />
	</header>
</template>

<style lang="scss" scoped>
.header {
	display: flex;
	flex-direction: row;
	gap: get-spacing();
	max-width: 100vw;
	padding: get-spacing() get-spacing();
	position: relative;

	&::after {
		background-color: var(--color-border);
		bottom: 0;
		content: '';
		display: block;
		height: 2px;
		left: get-spacing(x-small);
		position: absolute;
		right: get-spacing(x-small);
	}

	&.has-subtitle {
		padding: get-spacing(x-small) get-spacing();
	}
}

.subtitle,
.title {
	@include truncate-text;
	// text-align: center;
}

.subtitle {
	display: block;
	grid-area: subtitle;
	font-size: 0.75em;
	line-height: 1.25;
	margin-top: get-spacing(xx-small);
}

.title {
	color: var(--color-title);
	line-height: 1;
	margin: 0;
}

.title-wrapper {
	min-width: 1px;
}
</style>

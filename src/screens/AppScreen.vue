<script setup lang="ts">
import BaseScreen from '@/components/BaseScreen.vue';
import MainMenu from '@/components/MainMenu.vue';

/* ========================================================================== */

defineProps<{
	/**
	 * The title of the screen.
	 */
	title: string;
}>();
</script>

<template>
	<BaseScreen :title>
		<template #before-title>
			<slot name="before-title" />
		</template>

		<template #after-title>
			<MainMenu />
		</template>

		<template #subtitle>
			<slot name="subtitle" />
		</template>

		<slot />

		<template #primary-action>
			<slot name="primary-action" />
		</template>

		<template #secondary-action>
			<slot name="secondary-action" />
		</template>
	</BaseScreen>
</template>

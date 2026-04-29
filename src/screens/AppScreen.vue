<script setup lang="ts">
import { useRouter } from 'vue-router';

import BaseScreen from '@/components/BaseScreen.vue';
import MainMenu from '@/components/MainMenu.vue';
import { useGameLogic } from '@/composables/useGameLogic';

import { routeName } from '@/router/routerName';

/* ========================================================================== */

defineProps<{
	/**
	 * The title of the screen.
	 */
	title: string;
}>();

/* ========================================================================== */

const { clearGameData } = useGameLogic();
const router = useRouter();

function onResetConfirmed(): void {
	clearGameData();
	router.replace({ name: routeName.home });
}
</script>

<template>
	<BaseScreen :title>
		<template #before-title>
			<slot name="before-title" />
		</template>

		<template #after-title>
			<MainMenu @reset-confirmed="onResetConfirmed" />
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

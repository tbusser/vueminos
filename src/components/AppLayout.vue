<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useBottomSheet } from '@/composables/useBottomSheet.ts';
import { useGameLogic } from '@/composables/useGameLogic.ts';
import { useScreenTitle } from '@/composables/useScreenTitle.ts';

import { routeName } from '@/router/routerName.ts';

import HeaderBar from './HeaderBar.vue';
import MainMenu from './MainMenu.vue';

/* ========================================================================== */

const { isBottomSheetOpen } = useBottomSheet();
const gameLogic = useGameLogic();
const router = useRouter();

const { subtitle, title } = useScreenTitle();

/* -------------------------------------------------------------------------- */

function onResetConfirmed(): void {
	gameLogic.resetGameProgress();
	router.replace({ name: routeName.home });
}
</script>

<template>
	<main
		class="layout"
		:class="{ 'has-open-bottom-sheet': isBottomSheetOpen }"
	>
		<HeaderBar
			:title="title"
			:subtitle="subtitle"
		>
			<template #after-title>
				<MainMenu @reset-confirmed="onResetConfirmed" />
			</template>
		</HeaderBar>

		<slot />
	</main>
</template>

<style lang="scss" scoped>
.layout {
	background-color: var(--color-background);
	display: flex;
	flex-direction: column;
	height: 100dvh;
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
}

.has-open-bottom-sheet {
	border-radius: get-spacing(small);
	overflow: hidden;
	transform: scale(0.95) translateY(1vh);
}
</style>

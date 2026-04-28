<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import BottomSheet from '@/components/BottomSheet.vue';
import Leaderboard from '@/components/Leaderboard.vue';

import SettingsPanel from '@/components/SettingsPanel.vue';

import { useGameStore } from '@/stores/game';

/* ========================================================================== */

const { hasActiveGame } = storeToRefs(useGameStore());

/* -------------------------------------------------------------------------- */

const isOpen = ref(false);
const showLeaderboard = ref(false);

/* -------------------------------------------------------------------------- */

function onOpen(): void {
	showLeaderboard.value = false;
	isOpen.value = true;
}

function onClose(): void {
	isOpen.value = false;
}

</script>

<template>
	<button
		class="trigger"
		type="button"
		aria-label="Open menu"
		@click="onOpen"
	>
		<span class="trigger-bar" />
		<span class="trigger-bar" />
		<span class="trigger-bar" />
	</button>

	<BottomSheet
		:open="isOpen"
		@close="onClose"
	>
		<template #header>
			<header class="sheet-header">
				<h2 class="sheet-title">
					Menu
				</h2>
				<button
					class="close-button"
					type="button"
					@click="onClose"
				>
					Close
				</button>
			</header>
		</template>

		<div class="scroll-container">
			<div
				v-if="hasActiveGame"
				class="container"
			>
				<Leaderboard
					:highlight-current-player="true"
					:show-tiles="true"
				/>
			</div>
			<div class="container">
				<SettingsPanel />
			</div>
		</div>
	</BottomSheet>
</template>

<style lang="scss" scoped>
.close-button {
	background: none;
	padding: get-spacing(x-small) get-spacing();
}

.sheet-header {
	align-items: center;
	display: flex;
	justify-content: space-between;
	gap: get-spacing(small);
	padding: get-spacing(x-small) 0;
}

.sheet-title {
	color: var(--color-title);
	line-height: 1;
	margin: 0;
	padding-left: get-spacing();
}

.trigger {
	background: none;
	display: flex;
	flex-direction: column;
	gap: 4px;
	justify-content: center;
	padding: get-spacing(x-small);
}

.trigger-bar {
	background-color: var(--color-title);
	border-radius: 2px;
	display: block;
	height: 2px;
	width: 20px;
}

.container {
	flex-shrink: 0;
	scroll-snap-align: start;
	width: 100%;
}

.scroll-container {
	display: flex;
	flex-direction: row;
	gap: 20px;
	overflow-y: scroll;
	scroll-snap-type: x mandatory;
}
</style>

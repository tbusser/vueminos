<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useGameStore } from '@/stores/game';

import BottomSheet from '@/components/BottomSheet.vue';
import GameReset from '@/components/GameReset.vue';
import ScoreLeaderboard from '@/components/ScoreLeaderboard.vue';
import SettingsPanel from '@/components/SettingsPanel.vue';

import { useBuildInfo } from '@/composables/useBuildInfo';
import { useRounds } from '@/composables/useRounds';

/* ========================================================================== */

const emit = defineEmits<{ resetConfirmed: [] }>();

/* ========================================================================== */

const { hasActiveGame } = storeToRefs(useGameStore());
const { currentPlayer, tilesPerPlayer } = useRounds();
const { appVersion, formattedBuildTimestamp } = useBuildInfo();

/* -------------------------------------------------------------------------- */

const isOpen = ref(false);

/* -------------------------------------------------------------------------- */

function onResetConfirmed(): void {
	// Make sure the bottom sheet is closed before emitting the reset event.
	// Failure to do so will result in a UI glitch where the body is still
	// shrunk without the bottom sheet being visible.
	isOpen.value = false;

	nextTick(() => emit('resetConfirmed'));
}

function onOpen(): void {
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
		:aria-expanded="isOpen"
		:aria-label="$t('mainMenu.openLabel')"
		aria-haspopup="dialog"
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
					{{ $t('mainMenu.title') }}
				</h2>
				<button
					class="close-button"
					type="button"
					@click="onClose"
				>
					{{ $t('common.close') }}
				</button>
			</header>
		</template>

		<div class="scroll-container">
			<div
				v-if="hasActiveGame"
				class="container"
			>
				<ScoreLeaderboard
					:current-player-id="currentPlayer?.id"
					:tiles-per-player="tilesPerPlayer"
				/>
			</div>
			<div
				v-if="hasActiveGame"
				class="container"
			>
				<GameReset @confirmed="onResetConfirmed" />
			</div>

			<div class="container">
				<SettingsPanel />
			</div>
		</div>

		<template #footer>
			<small class="version-info">
				{{ $t('mainMenu.buildInfo', { version: appVersion, timestamp: formattedBuildTimestamp }) }}
			</small>
		</template>
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
	gap: get-spacing();
	overflow-x: auto;
	scroll-snap-type: x mandatory;
}

.version-info {
	border-top: 1px solid var(--color-border);
	padding-block: get-spacing(x-small);
	text-align: center;
}
</style>

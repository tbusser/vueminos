<script setup lang="ts">
import { computed, ref } from 'vue';

import { useGlobalI18n } from '@/i18n';

import BaseScreen from '@/components/BaseScreen.vue';
import CollectPointsPlayerItem from '@/components/CollectPointsPlayerItem.vue';
import MessageBox from '@/components/MessageBox.vue';
import PointsBottomSheet from '@/components/PointsBottomSheet.vue';

import { useCollectPoints } from '@/composables/useCollectPoints';

import type { Player } from '@/stores/players';
import type { PlayerScoreMap } from '@/stores/rounds';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'navigate-forward', leftoverPoints: PlayerScoreMap): void;
}>();

/* -------------------------------------------------------------------------- */

const { t } = useGlobalI18n();

const {
	activePlayers,
	areCollectedPointsComplete,
	collectedPoints,
	hasPlayerWonTheRound,
	isComplete,
	setCollectedPoints,
	winningPlayerName
} = useCollectPoints();

const isSheetOpen = ref<boolean>(false);
const selectedPlayer = ref<Player | undefined>(undefined);

/* -------------------------------------------------------------------------- */

const initialPoints = computed<number | undefined>(() =>
	(selectedPlayer.value === undefined) ? undefined : collectedPoints.value[selectedPlayer.value.id]
);

const infoMessage = computed<string>(() => {
	if (winningPlayerName.value === undefined) {
		return t('collectPoints.roundBlocked');
	}

	return t('collectPoints.roundWon', { winner: winningPlayerName.value });
});

/* -------------------------------------------------------------------------- */

function closeSheet(): void {
	isSheetOpen.value = false;
	selectedPlayer.value = undefined;
}

/* -------------------------------------------------------------------------- */

function onCollectPoints(player: Player): void {
	selectedPlayer.value = player;
	isSheetOpen.value = true;
}

function onCloseSheet(): void {
	closeSheet();
}

function onSavePoints(value?: number): void {
	// This should never happen, but just in case.
	if (selectedPlayer.value === undefined) return;

	// Set the left over points for the selected player.
	setCollectedPoints(selectedPlayer.value.id, value);

	closeSheet();
}

function onSubmit(): void {
	// Make sure all players have collected points.
	if (!areCollectedPointsComplete(collectedPoints.value)) return;

	emit('navigate-forward', collectedPoints.value);
}
</script>

<template>
	<BaseScreen :title="$t('collectPoints.title')">
		<MessageBox>
			{{ infoMessage }}
		</MessageBox>

		<ol>
			<template
				v-for="player in activePlayers"
				:key="player.id"
			>
				<li>
					<CollectPointsPlayerItem
						:is-winner="hasPlayerWonTheRound(player.id)"
						:player="player"
						:points="collectedPoints[player.id]"
						@collect="onCollectPoints"
					/>
				</li>
			</template>
		</ol>

		<PointsBottomSheet
			:initial-points
			:open="isSheetOpen"
			:player-name="selectedPlayer?.name"
			@cancel="onCloseSheet"
			@save="onSavePoints"
		/>

		<template #primary-action>
			<button
				type="button"
				:disabled="!isComplete"
				@click="onSubmit"
			>
				{{ $t('common.next') }}
			</button>
		</template>
	</BaseScreen>
</template>

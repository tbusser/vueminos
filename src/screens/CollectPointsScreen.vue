<script setup lang="ts">
import { computed, ref } from 'vue';

import BaseScreen from '@/components/BaseScreen.vue';
import CollectPointsPlayerItem from '@/components/CollectPointsPlayerItem.vue';
import MessageBox from '@/components/MessageBox.vue';
import PointsBottomSheet from '@/components/PointsBottomSheet.vue';
import { useCollectPoints } from '@/composables/useCollectPoints';

import { useGlobalI18n } from '@/i18n';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'navigate-forward', leftoverPoints: LeftoverPoints): void;
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

const points = ref<number | undefined>(undefined);

/* -------------------------------------------------------------------------- */

const infoMessage = computed<string>(() => {
	if (winningPlayerName.value === undefined) {
		return t('collectPoints.roundBlocked');
	}

	return t('collectPoints.roundWon', { winner: winningPlayerName.value });
});

/* -------------------------------------------------------------------------- */

function closeSheet(): void {
	// Reset the state of the sheet.
	isSheetOpen.value = false;

	// Clear the selected player and points.
	selectedPlayer.value = undefined;
	points.value = undefined;
}

/* -------------------------------------------------------------------------- */

function onCollectPoints(player: Player): void {
	selectedPlayer.value = player;
	points.value = collectedPoints.value[player.id];
	isSheetOpen.value = true;
}

function onCloseSheet(): void {
	closeSheet();
}

function onSavePoints(): void {
	// This should never happen, but just in case.
	if (selectedPlayer.value === undefined) return;

	// Set the left over points for the selected player.
	setCollectedPoints(selectedPlayer.value.id, points.value);

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
			v-model="points"
			:open="isSheetOpen"
			:player-name="selectedPlayer?.name"
			@cancel="onCloseSheet"
			@close="onSavePoints"
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

<script setup lang="ts">
import { computed, ref } from 'vue';

import AppScreen from '@/screens/AppScreen.vue';
import CollectPointsPlayerItem from '@/components/CollectPointsPlayerItem.vue';
import MessageBox from '@/components/MessageBox.vue';
import PointsBottomSheet from '@/components/PointsBottomSheet.vue';
import { useCollectPoints } from '@/composables/useCollectPoints';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'navigate-forward', leftoverPoints: LeftoverPoints): void;
}>();

/* -------------------------------------------------------------------------- */

const {
	activePlayers,
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
		return 'The round is blocked. The player with the fewest points left in their hand will be the round winner.';
	}

	return `${winningPlayerName.value} has won the round. The total value of points left in each player's hand will be added to their score.`;
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
	emit('navigate-forward', collectedPoints.value as LeftoverPoints);
}
</script>

<template>
	<AppScreen title="Collect Points">
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
	</AppScreen>
</template>

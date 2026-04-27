<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayersStore } from '@/stores/players';
import { useRoundsStore } from '@/stores/rounds';

import BaseScreen from '@/components/BaseScreen.vue';
import CollectPointsPlayerItem from '@/components/CollectPointsPlayerItem.vue';
import MessageBox from '@/components/MessageBox.vue';
import PointsBottomSheet from '@/components/PointsBottomSheet.vue';

/* ========================================================================== */

type CollectingLeftoverPoints = {
	[id: Id]: number | undefined;
};

/* -------------------------------------------------------------------------- */

const emit = defineEmits<{
	(event: 'navigate-forward', leftoverPoints: LeftoverPoints): void;
}>();

/* -------------------------------------------------------------------------- */

const playersStore = usePlayersStore();

const { activePlayers } = storeToRefs(playersStore);
const { currentRound } = storeToRefs(useRoundsStore());

const isSheetOpen = ref<boolean>(false);
const selectedPlayer = ref<Player | undefined>(undefined);

const points = ref<number | undefined>(undefined);

const leftOverPointsPerPlayer = reactive<CollectingLeftoverPoints>(activePlayers.value.reduce((acc, player) => {
	// The player who has won the round does not need to collect points.
	if (player.id === currentRound.value?.winnerId) return acc;

	return {
		...acc,
		[player.id]: undefined
	};
}, {}));

const canContinue = computed<boolean>(() => {
	const points = Object.values(leftOverPointsPerPlayer);

	return points.every((point) => point !== undefined);
});

const winningPlayerName = computed<string | undefined>(() => {
	if (currentRound.value?.winnerId === undefined) return undefined;

	const player = playersStore.getPlayerById(currentRound.value.winnerId);

	return player?.name;
});

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

function hasPlayerWonTheRound(player: Player): boolean {
	return currentRound.value?.winnerId === player.id;
}

/* -------------------------------------------------------------------------- */

function onCollectPoints(playerId: Id): void {
	selectedPlayer.value = playersStore.getPlayerById(playerId);
	points.value = leftOverPointsPerPlayer[playerId];
	isSheetOpen.value = true;
}

function onCloseSheet(): void {
	closeSheet();
}

function onSavePoints(): void {
	// This should never happen, but just in case.
	if (selectedPlayer.value === undefined) return;

	// Set the left over points for the selected player.
	leftOverPointsPerPlayer[selectedPlayer.value.id] = points.value;

	closeSheet();
}

function onSubmit(): void {
	emit('navigate-forward', leftOverPointsPerPlayer as Record<Id, number>);
}
</script>

<template>
	<BaseScreen title="Collect Points">
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
						:is-winner="hasPlayerWonTheRound(player)"
						:player="player"
						:points="leftOverPointsPerPlayer[player.id]"
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
				:disabled="!canContinue"
				@click="onSubmit"
			>
				{{ $t('common.next') }}
			</button>
		</template>
	</BaseScreen>
</template>

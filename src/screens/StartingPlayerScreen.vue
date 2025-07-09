<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayersStore } from '@/stores/players';

import BaseScreen from '@/components/BaseScreen.vue';
import MessageBox from '@/components/MessageBox.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import ToggleButtonGroup from '@/components/ToggleButtonGroup.vue';

import { useRules } from '@/composables/useRules';
import { useRoundsStore } from '@/stores/rounds';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'navigate-back'): void;
	(event: 'navigate-forward', id: Id): void;
}>();

/* -------------------------------------------------------------------------- */

const playerStore = usePlayersStore();
const roundsStore = useRoundsStore();

const { activePlayers } = storeToRefs(playerStore);
const { rounds } = storeToRefs(roundsStore);

const { startingStoneCount } = useRules();

const roundOrdinal = rounds.value.length;

const selectedId = ref<Id | undefined>(undefined);
const showValidationMessage = ref<boolean>(false);

/* -------------------------------------------------------------------------- */

watch(selectedId, () => showValidationMessage.value = false);

/* -------------------------------------------------------------------------- */

function onNavigateBack(): void {
	emit('navigate-back');
}

function onNavigateForward(): void {
	if (selectedId.value === undefined) {
		showValidationMessage.value = true;

		return;
	}

	emit('navigate-forward', selectedId.value);
}
</script>

<template>
	<BaseScreen :title="$t('playerSelect.title', [roundOrdinal])">
		<MessageBox>
			<div v-html="$t('playerSelect.infoMessage', [startingStoneCount])" />
		</MessageBox>

		<ToggleButtonGroup v-model="selectedId" orientation="vertical">
			<template v-for="player in activePlayers" :key="player.id">
				<ToggleButton :id="player.id">
					{{ player.name }}
				</ToggleButton>
			</template>
		</ToggleButtonGroup>

		<MessageBox v-if="showValidationMessage" type="warning">
			<div v-html="$t('validationMessages.startingPlayerRequired')" />
		</MessageBox>

		<template #primary-action>
			<button type="button" @click="onNavigateForward">
				{{ $t('common.next') }}
			</button>
		</template>

		<template #secondary-action>
			<button type="button" @click="onNavigateBack">
				{{ $t('common.back') }}
			</button>
		</template>
	</BaseScreen>
</template>

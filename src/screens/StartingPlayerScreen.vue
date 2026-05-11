<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { usePlayersStore } from '@/stores/players';

import MessageBox from '@/components/MessageBox.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import ToggleButtonGroup from '@/components/ToggleButtonGroup.vue';

import { useRules } from '@/composables/useRules';
import { useRoundsLogic } from '@/composables/useRoundsLogic';

import AppScreen from '@/screens/AppScreen.vue';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'navigate-back'): void;
	(event: 'navigate-forward', id: Id): void;
}>();

/* -------------------------------------------------------------------------- */

const { currentRoundOrdinal } = useRoundsLogic();

const playerStore = usePlayersStore();

const { activePlayers } = storeToRefs(playerStore);

const { determineStonesPerPlayer } = useRules();

const stonesPerPlayer = computed<number>(
	() => determineStonesPerPlayer(activePlayers.value.length)
);

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
	<AppScreen :title="$t('startingPlayer.title', { ordinal: currentRoundOrdinal ?? 0 })">
		<MessageBox>
			<i18n-t
				keypath="startingPlayer.description"
				tag="div"
			>
				<template #stones>
					<strong>{{ $t('common.tile', stonesPerPlayer) }}</strong>
				</template>
			</i18n-t>
		</MessageBox>

		<ToggleButtonGroup
			v-model="selectedId"
			orientation="vertical"
		>
			<template
				v-for="player in activePlayers"
				:key="player.id"
			>
				<ToggleButton :id="player.id">
					{{ player.name }}
				</ToggleButton>
			</template>
		</ToggleButtonGroup>

		<MessageBox
			v-if="showValidationMessage"
			type="warning"
		>
			<div v-html="$t('startingPlayer.errorNoStartingPlayer')" />
		</MessageBox>

		<template #primary-action>
			<button
				type="button"
				@click="onNavigateForward"
			>
				{{ $t('common.next') }}
			</button>
		</template>

		<template #secondary-action>
			<button
				type="button"
				@click="onNavigateBack"
			>
				{{ $t('common.back') }}
			</button>
		</template>
	</AppScreen>
</template>

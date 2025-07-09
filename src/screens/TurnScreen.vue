<script setup lang="ts">
import { computed, ref } from 'vue';

import BaseScreen from '@/components/BaseScreen.vue';
import NumberDisplay from '@/components/NumberDisplay.vue';
import NumberInput from '@/components/NumberInput.vue';
import NumberSpinner from '@/components/NumberSpinner.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import ToggleButtonGroup from '@/components/ToggleButtonGroup.vue';

import { useRules } from '@/composables/useRules';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'turn-played', turn: ScoredTurnInput): void;
}>();

withDefaults(defineProps<{
	isInitialTurn?: boolean;
	subtitle: string;
	title: string;
}>(), {
	isInitialTurn: false
});

/* -------------------------------------------------------------------------- */

const { calculateStartingStoneBonus, calculateTurnScore } = useRules();

const isTripleStone = ref<boolean>(false);
const tilesDrawn = ref<number>(0);
const tileValue = ref<number | undefined>(undefined);

const openingTurnBonus = computed<number>(() => calculateStartingStoneBonus(tileValue.value));

const isTripleStoneEnabled = computed<boolean>(() => {
	if (tileValue.value === undefined) return false;

	return (tileValue.value % 3 === 0);
});

/* -------------------------------------------------------------------------- */

/**
 * Creates a ScoredTurnInput object based on what the user has selected in the
 * turn screen.
 *
 * @returns A ScoredTurnInput object containing the turn input and the score.
 */
function createScoredTurnInput(): ScoredTurnInput {
	const turnInput: TurnInput = {
		bonusBridge: false,
		bonusDouble: false,
		bonusHexagon: false,
		tilesDrawn: tilesDrawn.value,
		tilesPlayed: tileValue.value === undefined ? 0 : 1,
		tileValue: tileValue.value,
		triple: isTripleStone.value
	};

	return {
		...turnInput,
		score: calculateTurnScore(turnInput)
	};
}

/* -------------------------------------------------------------------------- */

function onNavigateForward() {
	emit('turn-played', createScoredTurnInput());
}

function onToggleIsTripleStone(value: boolean) {
	isTripleStone.value = value;
}
</script>

<template>
	<BaseScreen :title>
		<template #subtitle>
			{{ subtitle }}
		</template>

		<NumberDisplay :value="tileValue" />
		<NumberInput v-model="tileValue" />

		<template v-if="isInitialTurn">
			<ToggleButton
				@toggle="onToggleIsTripleStone"
				:allow-wrap="true"
				:is-selected="isTripleStone"
				:is-disabled="!isTripleStoneEnabled"
			>
				{{ $t('turnView.isTripleStone', [openingTurnBonus]) }}
			</ToggleButton>
		</template>
		<template v-else>
			<div class="tiles-drawn-wrapper">
				<label for="tiles-drawn">Tiles drawn</label>
				<number-spinner v-model="tilesDrawn" :max="99" />
			</div>

			<ToggleButtonGroup
				orientation="horizontal"
			>
				<ToggleButton id="bridge">
					<img src="@/assets/images/bridge.png" alt="Bridge" />
					bridge
				</ToggleButton>
				<ToggleButton id="double">
					<img src="@/assets/images/double-sided.png" alt="Double" />
					double
				</ToggleButton>
				<ToggleButton id="hexagon">
					<img src="@/assets/images/hexagon.png" alt="Hexagon" />
					hexagon
				</ToggleButton>
			</ToggleButtonGroup>

		</template>

		<template #primary-action>
			<button type="button" @click="onNavigateForward">
				{{ $t('common.next') }}
			</button>
		</template>
	</BaseScreen>
</template>

<style scoped lang="scss">
.tiles-drawn-wrapper {
	align-items: center;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}
</style>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';

import BaseScreen from '@/components/BaseScreen.vue';
import NumberDisplay from '@/components/NumberDisplay.vue';
import NumberInput from '@/components/NumberInput.vue';
import NumberSpinner from '@/components/NumberSpinner.vue';
import ShapeToggleButton from '@/components/ShapeToggleButton.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import ToggleButtonGroup from '@/components/ToggleButtonGroup.vue';

import { useRules } from '@/composables/useRules';

/* ========================================================================== */

type BonusShape = 'bridge' | 'double' | 'hexagon';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'turn-played', turn: ScoredTurnInput): void;
}>();

const props = withDefaults(defineProps<{
	isInitialTurn?: boolean;
	subtitle: string;
	title: string;
}>(), {
	isInitialTurn: false
});

/* -------------------------------------------------------------------------- */

const { calculateStartingStoneBonus, calculateTurnScore } = useRules();

const isTripleStone = ref<boolean>(false);
const selectedBonusShape = ref<BonusShape | undefined>(undefined);
const tilesDrawn = ref<number>(0);
const tileValue = ref<number | undefined>(undefined);

const openingTurnBonus = computed<number>(() => calculateStartingStoneBonus(tileValue.value));

const isTripleStoneEnabled = computed<boolean>(() => {
	if (tileValue.value === undefined) return false;

	return (tileValue.value % 3 === 0);
});

/* -------------------------------------------------------------------------- */

watchEffect(() => {
	if (isTripleStoneEnabled.value) return;

	// When the played value cannot be a triple, the isTripleStone flag should
	// be reset to false.
	isTripleStone.value = false;
});

/* -------------------------------------------------------------------------- */

/**
 * Creates a ScoredTurnInput object based on what the user has selected in the
 * turn screen.
 *
 * @returns A ScoredTurnInput object containing the turn input and the score.
 */
function createScoredTurnInput(): ScoredTurnInput {
	const turnInput: TurnInput = tileValue.value === undefined
		? {
			tilesDrawn: tilesDrawn.value,
			tilesPlayed: 0,
			tileValue: undefined
		}
		: {
			bonusBridge: selectedBonusShape.value === 'bridge',
			bonusDouble: selectedBonusShape.value === 'double',
			bonusHexagon: selectedBonusShape.value === 'hexagon',
			tilesDrawn: tilesDrawn.value,
			tilesPlayed: 1,
			tileValue: tileValue.value,
			triple: props.isInitialTurn && isTripleStone.value
		};

	return {
		...turnInput,
		score: calculateTurnScore(turnInput)
	};
}

/* -------------------------------------------------------------------------- */

function onToggleBonusScoring(value: string | string[] | undefined) {
	selectedBonusShape.value = value as BonusShape;
}

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
			<ToggleButton v-if="isTripleStoneEnabled"
				@toggle="onToggleIsTripleStone"
				:allow-wrap="true"
				:is-selected="isTripleStone"
			>
				{{ $t('turnView.isTripleStone', [openingTurnBonus]) }}
			</ToggleButton>
		</template>
		<template v-else>
			<div class="tiles-drawn-wrapper">
				<label for="tiles-drawn">Tiles drawn</label>
				<number-spinner v-model="tilesDrawn" :max="99" />
			</div>

			<div>
				<label>Bonus scoring</label>

				<ToggleButtonGroup
					orientation="horizontal"
					@update:model-value="onToggleBonusScoring"
				>
					<ShapeToggleButton :id="'bridge' satisfies BonusShape">
						<img src="@/assets/images/bridge.png" alt="Bridge" />
						bridge
					</ShapeToggleButton>
					<ShapeToggleButton :id="'double' satisfies BonusShape">
						<img src="@/assets/images/double-sided.png" alt="Double" />
						double
					</ShapeToggleButton>
					<ShapeToggleButton :id="'hexagon' satisfies BonusShape">
						<img src="@/assets/images/hexagon.png" alt="Hexagon" />
						hexagon
					</ShapeToggleButton>
				</ToggleButtonGroup>
			</div>
		</template>

		<template #primary-action>
			<button type="button" @click="onNavigateForward">
				{{ $t('common.next') }}
			</button>
		</template>
	</BaseScreen>
</template>

<style scoped lang="scss">
.completed-shape {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: get-spacing(x-small);

	img {
		width: 48px;
		height: 48px;
	}
}

.tiles-drawn-wrapper {
	align-items: center;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}
</style>

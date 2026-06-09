<script setup lang="ts">
/* -----------------------------------------------------------------------------
 | Intended usage:
 | The turn screen is meant to display a single turn. When a different turn
 | needs to be displayed, the parent component should re-key the turn screen.
 | This is done by passing a unique key to the `key` runtime attribute on the
 | turn screen component in the parent template. Just updating the props will
 | not be enough.
 \--------------------------------------------------------------------------- */

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
	(event: 'turn-played', turn: TurnInput): void;
}>();

const props = withDefaults(defineProps<{
	isInitialTurn?: boolean;
	primaryActionLabel: string;
	subtitle: string;
	title: string;
	turn: Turn | null;
}>(), {
	isInitialTurn: false,
	turn: null
});

/* -------------------------------------------------------------------------- */

const { calculateStartingTileBonus, canTileBeTripleStone } = useRules();

/* -------------------------------------------------------------------------- */

// These refs are initialized once from props.turn at mount time. The parent is
// responsible for re-keying this component whenever the turn changes, so no
// watchers are needed here.
const isTripleStone = ref<boolean>(
	props.turn?.tilesPlayed === 1 ? props.turn.triple : false
);
const selectedBonusShape = ref<BonusShape | undefined>(getInitialBonusShape());
const tilesDrawn = ref<number>(props.turn?.tilesDrawn ?? 0);
const tileValue = ref<number | undefined>(props.turn?.tileValue);

/* -------------------------------------------------------------------------- */

const openingTurnBonus = computed<number>(() =>
	(tileValue.value === undefined) ? 0 : calculateStartingTileBonus(tileValue.value)
);

const isTripleStoneEnabled = computed<boolean>(() =>
	(tileValue.value === undefined) ? false : canTileBeTripleStone(tileValue.value)
);

/* -------------------------------------------------------------------------- */

watchEffect(() => {
	if (isTripleStoneEnabled.value) return;

	// When the played value cannot be a triple, the isTripleStone flag should
	// be reset to false.
	isTripleStone.value = false;
});

/* -------------------------------------------------------------------------- */

/**
 * Creates a TurnInput object based on what the user has selected in the
 * turn screen.
 *
 * @returns A TurnInput object containing the turn input.
 */
function createTurnInput(): TurnInput {
	return tileValue.value === undefined
		? {
			// On an initial turn the user has no option to draw tiles.
			tilesDrawn: props.isInitialTurn ? 0 : tilesDrawn.value,
			tilesPlayed: 0,
			tileValue: undefined
		}
		: {
			bonusBridge: selectedBonusShape.value === 'bridge',
			bonusDouble: selectedBonusShape.value === 'double',
			bonusHexagon: selectedBonusShape.value === 'hexagon',
			// On an initial turn the user has no option to draw tiles.
			tilesDrawn: props.isInitialTurn ? 0 : tilesDrawn.value,
			tilesPlayed: 1,
			tileValue: tileValue.value,
			triple: props.isInitialTurn && isTripleStone.value
		};
}

function getInitialBonusShape(): BonusShape | undefined {
	if (props.turn === null) return undefined;
	if (props.turn.tilesPlayed === 0) return undefined;

	if (props.turn.bonusBridge) return 'bridge';
	if (props.turn.bonusDouble) return 'double';
	if (props.turn.bonusHexagon) return 'hexagon';

	return undefined;
}

/* -------------------------------------------------------------------------- */

function onToggleBonusScoring(value: string | string[] | undefined) {
	if (Array.isArray(value)) return;

	selectedBonusShape.value = value as BonusShape | undefined;
}

function onNavigateForward() {
	emit('turn-played', createTurnInput());
}

function onToggleIsTripleStone(value: boolean) {
	isTripleStone.value = value;
}
</script>

<template>
	<BaseScreen
		:title
		:subtitle
	>
		<NumberDisplay :value="tileValue" />
		<NumberInput v-model="tileValue" />

		<template v-if="isInitialTurn">
			<ToggleButton
				v-if="isTripleStoneEnabled"
				:allow-wrap="true"
				:is-selected="isTripleStone"
				@toggle="onToggleIsTripleStone"
			>
				{{ $t('turn.tripleStone', { bonus: openingTurnBonus }) }}
			</ToggleButton>
		</template>
		<template v-else>
			<div class="tiles-drawn-wrapper">
				<label for="tiles-drawn">
					{{ $t('turn.tilesDrawnLabel') }}
				</label>
				<number-spinner
					v-model="tilesDrawn"
					:max="3"
					:value-label="$t('turn.numberSpinnerValueLabel')"
				/>
			</div>

			<div>
				<label>
					{{ $t('turn.bonusScoringLabel') }}
				</label>

				<ToggleButtonGroup
					orientation="horizontal"
					:model-value="selectedBonusShape"
					@update:model-value="onToggleBonusScoring"
				>
					<ShapeToggleButton :id="'bridge' satisfies BonusShape">
						<img
							src="@/assets/images/bridge.png"
							:alt="$t('turn.bonusBridgeLabel')"
						>
						{{ $t('turn.bonusBridgeLabel') }}
					</ShapeToggleButton>
					<ShapeToggleButton :id="'double' satisfies BonusShape">
						<img
							src="@/assets/images/double-sided.png"
							:alt="$t('turn.bonusDoubleLabel')"
						>
						{{ $t('turn.bonusDoubleLabel') }}
					</ShapeToggleButton>
					<ShapeToggleButton :id="'hexagon' satisfies BonusShape">
						<img
							src="@/assets/images/hexagon.png"
							:alt="$t('turn.bonusHexagonLabel')"
						>
						{{ $t('turn.bonusHexagonLabel') }}
					</ShapeToggleButton>
				</ToggleButtonGroup>
			</div>
		</template>

		<template #primary-action>
			<button
				type="button"
				@click="onNavigateForward"
			>
				{{ primaryActionLabel }}
			</button>
		</template>
		<template #secondary-action>
			<slot name="secondary-action" />
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

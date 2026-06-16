<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useGlobalI18n } from '@/i18n';

import { routeName } from '@/router/routerName';

import HistoryNavigation from '@/components/HistoryNavigation.vue';

import CollectPointsScreen from '@/screens/CollectPointsScreen.vue';
import StartingPlayerScreen from '@/screens/StartingPlayerScreen.vue';
import TurnScreen from '@/screens/TurnScreen.vue';

import { useGameScores } from '@/composables/useGameScores';
import { useNavigation } from '@/composables/useNavigation';
import { useRounds } from '@/composables/useRounds';
import { useTurnHistory } from '@/composables/useTurnHistory';

import { useRoundsStore } from '@/stores/rounds';
import type { TurnInput } from '@/stores/turns';

/* ========================================================================== */

const router = useRouter();

const { t } = useGlobalI18n();
const roundsStore = useRoundsStore();

const { totalScore } = useGameScores();
const {
	canGoBack,
	canGoForward,
	goBack, goForward,
	selectedPlayer: historicalTurnPlayer,
	selectedTurn: historicalTurn
} = useTurnHistory();

const { safeNavigateBack } = useNavigation();
const { currentPlayerStats, hasCurrentRound } = storeToRefs(roundsStore);
const {
	currentPhase,
	currentPlayer,
	finishCurrentRound,
	isFirstTurnOfRound,
	isTurnFirstTurnOfRound,
	saveTurn,
	setStartingPlayer,
	startNewRound,
	tilesPerPlayer,
	updateTurn
} = useRounds();
const turnKey = ref<symbol>(Symbol('turn'));

const errorMessage = ref<string | undefined>(undefined);

/* -------------------------------------------------------------------------- */

/**
 * Whenever the current player or the historical turn player changes, indicating
 * that a different turn is being played / shown, update the turn key to a new
 * symbol. This forces the TurnScreen component to remount and start fresh.
 */
watch(
	[currentPlayer, historicalTurnPlayer],
	() => turnKey.value = Symbol('turn')
);

/* -------------------------------------------------------------------------- */

const subtitle = computed<string>(() => {
	// When the user navigated back in history, use the information from the
	// selected turn, otherwise use the information from the current player.
	const playerId = historicalTurnPlayer.value?.id ?? currentPlayerStats.value?.id;
	if (playerId === undefined) return '';

	const playerScore = totalScore.value[playerId];
	const tileCount = tilesPerPlayer.value?.[playerId] ?? 0;

	return `${t('common.points', playerScore)} | ${t('common.tile', tileCount)}`;
});

const playerName = computed<string>(() => {
	// When the user navigated back in history, return the player's name of the
	// turn navigated to instead of using the value of the current player.
	if (historicalTurnPlayer.value) return historicalTurnPlayer.value.name;
	// When the user is on the live round, return the name of the
	// current player.
	if (currentPlayer.value) return currentPlayer.value.name;

	// No player is selected, return an empty string.
	return '';
});

const isInitialTurn = computed<boolean>(() =>
	// When a historical turn is selected, check if it is the first turn of
	// the round, otherwise check if the current turn is the first turn of
	// the round.
	(historicalTurn.value !== null) ? isTurnFirstTurnOfRound(historicalTurn.value.id) : isFirstTurnOfRound.value
);

const showHistoryNavigation = computed<boolean>(() => {
	// When a historical turn is selected, or the current turn is not the
	// initial turn, show the history navigation.
	return historicalTurn.value !== null || !isInitialTurn.value;
});

const primaryActionLabel = computed<string>(() =>
	(historicalTurn.value === null) ? t('common.next') : t('common.update')
);

/* -------------------------------------------------------------------------- */

onMounted(() => {
	if (hasCurrentRound.value) return;

	const result = startNewRound();
	if (!result.success) console.error('Unexpected: startNewRound failed on mount', result.message);
});
/* -------------------------------------------------------------------------- */

/**
 * Handles navigation back. Not all phases allow navigation back, so this
 * function checks the current round phase before allowing navigation.
 */
function onNavigateBack(): void {
	if (currentPhase.value === 'player-select') {
		safeNavigateBack();
	}
}

function onNavigateBackInHistory(): void {
	goBack();
}

function onNavigateForwardInHistory(): void {
	goForward();
}

function onNavigateForwardFromCollectPoints(leftoverPoints: Record<Id, number>): void {
	errorMessage.value = undefined;

	const result = finishCurrentRound(leftoverPoints);
	if (!result.success) {
		errorMessage.value = result.message;
		return;
	}

	// Check if the game is over and when it is, go to the game over screen.
	if (result.gameOver) {
		// The game is finished, go to the game over screen.
		router.replace({ name: routeName.gameResult });
		return;
	}

	// The game is not yet finished, start a new round.
	const newRoundResult = startNewRound();
	// startNewRound cannot fail at this point: we just completed the
	// current round, and the game is still active.
	if (!newRoundResult.success) console.error('Unexpected: startNewRound failed', newRoundResult.message);
}

/**
 * Sets the starting player for the active round and navigates to the next
 * phase of the round.
 * @param playerId The ID of the player to set as the starting player.
 */
function onNavigateForwardFromStartingPlayer(playerId: Id): void {
	const result = setStartingPlayer(playerId);
	// This should never happen and if it does, it is not something the user can
	// do something to recover from this.
	if (!result.success) console.error('Unexpected: setStartingPlayer failed', result.message);
}

function onTurnPlayed(turn: TurnInput): void {
	errorMessage.value = undefined;

	if (historicalTurn.value === null) {
		const result = saveTurn(turn);
		if (!result.success) errorMessage.value = result.message;
	} else if (historicalTurnPlayer.value) {
		const result = updateTurn(historicalTurn.value.id, turn);
		if (!result.success) errorMessage.value = result.message;
	}
}
</script>

<template>
	<StartingPlayerScreen
		v-if="currentPhase === 'player-select'"
		@navigate-back="onNavigateBack"
		@navigate-forward="onNavigateForwardFromStartingPlayer"
	/>

	<TurnScreen
		v-else-if="currentPhase === 'turns'"
		:key="turnKey"
		:error-message="errorMessage"
		:is-initial-turn="isInitialTurn"
		:primary-action-label="primaryActionLabel"
		:subtitle
		:title="playerName"
		:turn="historicalTurn"
		@turn-played="onTurnPlayed"
	>
		<template
			v-if="showHistoryNavigation"
			#secondary-action
		>
			<HistoryNavigation
				:can-go-back="canGoBack"
				:can-go-forward="canGoForward"
				@go-back="onNavigateBackInHistory"
				@go-forward="onNavigateForwardInHistory"
			/>
		</template>
	</TurnScreen>

	<CollectPointsScreen
		v-else-if="currentPhase === 'round-end'"
		:error-message="errorMessage"
		@navigate-forward="onNavigateForwardFromCollectPoints"
	/>
</template>

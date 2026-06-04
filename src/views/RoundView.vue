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

/* ========================================================================== */

const router = useRouter();

const { t } = useGlobalI18n();
const roundsStore = useRoundsStore();

const { hasReachedPointsLimit, totalScore } = useGameScores();
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
	if (!hasCurrentRound.value) startNewRound();
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
	finishCurrentRound(leftoverPoints);
	// Check if the game is over and when it is, go to the game over screen.
	if (hasReachedPointsLimit.value) {
		// The game is finished, go to the game over screen.
		router.replace({ name: routeName.gameResult });
	} else {
		// The game is not yet finished, start a new round.
		startNewRound();
	}
}

/**
 * Sets the starting player for the active round and navigates to the next
 * phase of the round.
 * @param playerId The ID of the player to set as the starting player.
 */
function onNavigateForwardFromStartingPlayer(playerId: Id): void {
	setStartingPlayer(playerId);
}

function onTurnPlayed(turn: TurnInput): void {
	if (historicalTurn.value === null) {
		saveTurn(turn);
	} else if (historicalTurnPlayer.value) {
		updateTurn(historicalTurn.value.id, turn);
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
		@navigate-forward="onNavigateForwardFromCollectPoints"
	/>
</template>

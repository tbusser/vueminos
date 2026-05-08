<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useGlobalI18n } from '@/i18n';

import { routeName } from '@/router/routerName';

import CollectPointsScreen from '@/screens/CollectPointsScreen.vue';
import StartingPlayerScreen from '@/screens/StartingPlayerScreen.vue';
import TurnScreen from '@/screens/TurnScreen.vue';

import { useGameScores } from '@/composables/useGameScores';
import { useNavigation } from '@/composables/useNavigation';
import { useRoundsLogic } from '@/composables/useRoundsLogic';
import { useRoundManager } from '@/composables/useRoundManager';

import { useRoundsStore } from '@/stores/rounds';

/* ========================================================================== */

const router = useRouter();

const { t } = useGlobalI18n();
const roundsStore = useRoundsStore();

const { hasReachedPointsLimit } = useGameScores();

const { safeNavigateBack } = useNavigation();
const { startNewRound } = useRoundsLogic();
const { currentPlayerStats, hasCurrentRound } = storeToRefs(roundsStore);
const { currentPhase, currentPlayer, finishRound, isFirstTurnOfRound, saveTurn, setStartingPlayer } = useRoundManager();
const { totalScore } = useGameScores();

const turnKey = ref<symbol>(Symbol(''));

/* -------------------------------------------------------------------------- */

const subtitle = computed<string>(() => {
	if (currentPlayerStats.value === undefined) return '';

	const playerScore = totalScore.value[currentPlayerStats.value.id];

	return `${t('common.points', playerScore)} | ${t('common.tile', currentPlayerStats.value.tiles)}`;
});

/* -------------------------------------------------------------------------- */

onMounted(() => {
	if (!hasCurrentRound.value) {
		startNewRound();
	}
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

function onNavigateForwardFromCollectPoints(leftoverPoints: Record<Id, number>): void {
	finishRound(leftoverPoints);
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

function onTurnPlayed(turn: ScoredTurnInput): void {
	saveTurn(turn);

	turnKey.value = Symbol('turn');
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
		:is-initial-turn="isFirstTurnOfRound"
		:subtitle
		:title="currentPlayer?.name ?? ''"
		@turn-played="onTurnPlayed"
	/>

	<CollectPointsScreen
		v-else-if="currentPhase === 'round-end'"
		@navigate-forward="onNavigateForwardFromCollectPoints"
	/>
</template>

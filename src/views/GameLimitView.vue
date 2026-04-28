<script setup lang="ts">
import { useRouter } from 'vue-router';

import { routeName } from '@/router/routerName';

import GameLimitScreen from '@/screens/GameLimitScreen.vue';

import { useNavigation } from '@/composables/useNavigation';
import { useGameLogic } from '@/composables/useGameLogic';

/* ========================================================================== */

const { startNewGame } = useGameLogic();
const { safeNavigateBack } = useNavigation();
const router = useRouter();

/* -------------------------------------------------------------------------- */

/**
 * Handles navigation back, using safe navigation logic.
 */
function onNavigateBack(): void {
	safeNavigateBack();
}

/**
 * Starts a new game with the given limit and navigates to the round view.
 */
function onNavigateForward(limit: number): void {
	// When the game couldn't be started, we don't navigate forward. The limit
	// is probably invalid.
	if (startNewGame(limit).success) {
		router.push({ name: routeName.round });
	}
}
</script>

<template>
	<GameLimitScreen
		@navigate-back="onNavigateBack"
		@navigate-forward="onNavigateForward"
	/>
</template>

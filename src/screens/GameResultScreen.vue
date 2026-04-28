<script setup lang="ts">
import BaseScreen from '@/components/BaseScreen.vue';
import Leaderboard from '@/components/Leaderboard.vue';
import MessageBox from '@/components/MessageBox.vue';
import { useGameScores } from '@/composables/useGameScores';

/* ========================================================================== */

/**
 * Emits when the user wants to start a new game.
 * @event new-game
 */
const emit = defineEmits<{
	( e: 'new-game' ): void;
}>();

/* ========================================================================== */

const { winner } = useGameScores();

function onContinue() {
	emit('new-game');
}
</script>

<template>
	<BaseScreen title="Game over">
		<MessageBox>
			The game is over. The winner is {{ winner?.name }} with the highest score.
		</MessageBox>

		<Leaderboard :show-tiles="false" />

		<template #primary-action>
			<button
				@click="onContinue"
			>
				New Game
			</button>
		</template>
	</BaseScreen>
</template>

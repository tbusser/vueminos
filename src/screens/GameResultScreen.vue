<script setup lang="ts">
import AppScreen from '@/screens/AppScreen.vue';
import ScoreLeaderboard from '@/components/ScoreLeaderboard.vue';
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
	<AppScreen :title="$t('gameResult.title')">
		<MessageBox>
			{{ $t('gameResult.description', { winner: winner?.name }) }}
		</MessageBox>

		<ScoreLeaderboard />

		<template #primary-action>
			<button
				@click="onContinue"
			>
				{{ $t('gameResult.newGameLabel') }}
			</button>
		</template>
	</AppScreen>
</template>

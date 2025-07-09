<script setup lang="ts">
import { useGlobalI18n } from '@/i18n';
import { computed } from 'vue';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'collect', playerId: Id): void
}>();

const props = defineProps<{
	/**
	 * Indicates whether the player is the winner of the round.
	 */
	isWinner: boolean;

	/**
	 * The player object containing player details.
	 */
	player: Player;

	/**
	 * The number of points still in the player's hand.
	 */
	points: number | undefined;
}>();

/* -------------------------------------------------------------------------- */

const { t } = useGlobalI18n();

/* -------------------------------------------------------------------------- */

/**
 * Indicates whether or not points have already been collected for this player.
 */
const hasPoints = computed<boolean>(() => props.points !== undefined);

const message = computed<string>(() => {
	if (props.isWinner) return t('collectPoints.winner');

	return hasPoints.value
		? t('collectPoints.pointsCollected', [props.points])
		: t('collectPoints.pointsNotCollected');
});

/* -------------------------------------------------------------------------- */

/**
 * Handles the click event on the player item button. It will emit a 'collect'
 * event with the player's ID when the button is clicked.
 */
function onClick(): void {
	emit('collect', props.player.id);
}
</script>

<template>
	<button type="button" :disabled="isWinner" @click="onClick" class="button">
		<strong>{{ player.name }}</strong>
		{{ message }}
	</button>
</template>


<style lang="scss" scoped>
.button {
	align-items: start;
	flex-direction: column;
	gap: get-spacing(xx-small);
	width: 100%;
}
</style>

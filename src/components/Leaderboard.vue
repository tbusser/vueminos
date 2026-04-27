<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useGameScores } from '@/composables/useGameScores';
import { usePlayerManager } from '@/composables/usePlayerManager';

import { useRoundsStore } from '@/stores/rounds';

/* ========================================================================== */

type LeaderboardEntry = {
	name: string;
	score: number;
	tiles: number;
};

/* ========================================================================== */

defineProps<{
	/**
	 * Determines whether to show the tiles column in the leaderboard.
	 */
	showTiles: boolean;
}>();

/* ========================================================================== */

const { totalScore } = useGameScores();
const { players } = usePlayerManager();
const { currentRound } = storeToRefs(useRoundsStore());

/* -------------------------------------------------------------------------- */

const leaderboardData = computed<LeaderboardEntry[]>(() => {
	return players.value.map(player => {
		const stats = currentRound.value?.playerStats.find(stat => stat.id === player.id);

		return {
			name: player.name,
			score: totalScore.value[player.id],
			tiles: stats?.tiles ?? 0
		};
	}).sort((a, b) => b.score - a.score);
});
</script>

<template>
	<table class="leaderboard">
		<thead>
			<tr>
				<th class="header-cell">
					#
				</th>
				<th class="header-cell">
					Name
				</th>
				<th
					v-if="showTiles"
					class="header-cell"
				>
					Tiles
				</th>
				<th class="header-cell">
					Score
				</th>
			</tr>
		</thead>
		<tbody>
			<tr
				v-for="(entry, index) of leaderboardData"
				:key="entry.name"
				class="player-row"
			>
				<td>{{ index + 1 }}</td>
				<td class="name-cell">
					{{ entry.name }}
				</td>
				<td
					v-if="showTiles"
					class="numeric-cell"
				>
					{{ entry.tiles }}
				</td>
				<td class="numeric-cell">
					{{ entry.score }}
				</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped lang="scss">
.header-cell {
	text-align: left;
}

.leaderboard {
	td, th {
		padding: 2px 10px;
	}
}

.name-cell {
	width: 100%;
}

.numeric-cell {
	text-align: right;
}

.player-row:nth-child(odd) {
	td {
		background-color: rgba(0, 0, 0, 0.05);
	}
}
</style>

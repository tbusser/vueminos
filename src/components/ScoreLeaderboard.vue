<script setup lang="ts">
import { computed } from 'vue';

import { useGameScores } from '@/composables/useGameScores';
import { usePlayerManager } from '@/composables/usePlayerManager';

/* ========================================================================== */

type LeaderboardEntry = {
	id: Id;
	name: string;
	score: number;
	tiles: number;
};

/* ========================================================================== */

const props = defineProps<{
	/**
	 * Optional prop to specify the current player. When provided the player
	 * will be highlighted in the leaderboard.
	 */
	currentPlayerId?: Id;

	/**
	 * When provided, the leaderboard will show per player how many tiles they
	 * have left in their hand.
	 */
	tilesPerPlayer?: TilesPerPlayer;
}>();

/* ========================================================================== */

const { totalScore } = useGameScores();
const { players } = usePlayerManager();

const showTiles = computed<boolean>(() => props.tilesPerPlayer !== undefined);

/* -------------------------------------------------------------------------- */

const leaderboardData = computed<LeaderboardEntry[]>(() => {
	return players.value.map(player => {
		const tiles = showTiles.value ? (props.tilesPerPlayer?.[player.id] ?? 0) : 0;

		return {
			id: player.id,
			name: player.name,
			score: totalScore.value[player.id],
			tiles
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
					{{ $t('scoreLeaderboard.nameLabel') }}
				</th>
				<th
					v-if="showTiles"
					class="header-cell"
				>
					{{ $t('scoreLeaderboard.tilesLabel') }}
				</th>
				<th class="header-cell">
					{{ $t('scoreLeaderboard.scoreLabel') }}
				</th>
			</tr>
		</thead>
		<tbody>
			<tr
				v-for="(entry, index) of leaderboardData"
				:key="entry.id"
				class="player-row"
				:class="{ 'is-current-player': entry.id === currentPlayerId }"
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

.is-current-player td {
	font-size: 1.05em;
	font-weight: bold;
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

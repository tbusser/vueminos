<script setup lang="ts">
import { useRouter } from 'vue-router';

import { routeName } from '@/router/routerName';

import GamePlayersScreen from '@/screens/GamePlayersScreen.vue';

/* ========================================================================== */

const router = useRouter();

function onNavigateForward() {
	router.push({ name: routeName.gameLimit });
}
</script>

<template>
	<GamePlayersScreen
		@navigate-forward="onNavigateForward"
	/>
</template>

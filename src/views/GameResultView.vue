<script lang="ts" setup>
import { useRouter } from 'vue-router';

import GameResultScreen from '@/screens/GameResultScreen.vue';

import { routeName } from '@/router/routerName';

import { useGameLogic } from '@/composables/useGameLogic';

/* ========================================================================== */

const router = useRouter();
const gameLogic = useGameLogic();

/* -------------------------------------------------------------------------- */

function onNewGame() {
	gameLogic.resetGameProgress();
	router.replace({ name: routeName.home });
}
</script>

<template>
	<GameResultScreen @new-game="onNewGame" />
</template>

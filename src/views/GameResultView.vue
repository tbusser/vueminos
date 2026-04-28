<script lang="ts" setup>
import GameResultScreen from '@/screens/GameResultScreen.vue';

import { router } from '@/router';
import { routeName } from '@/router/routerName';

import { useGameLogic } from '@/composables/useGameLogic';

/* ========================================================================== */

const gameLogic = useGameLogic();

/* -------------------------------------------------------------------------- */

function onNewGame() {
	gameLogic.clearGameData();
	router.replace({ name: routeName.home });
}
</script>

<template>
	<GameResultScreen @new-game="onNewGame" />
</template>

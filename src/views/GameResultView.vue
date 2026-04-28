<script lang="ts" setup>
import GameResultScreen from '@/screens/GameResultScreen.vue';

import { router } from '@/router';
import { routeName } from '@/router/routerName';

import { useGameLogic } from '@/composables/useGameLogic';

/* ========================================================================== */

function onNewGame() {
	useGameLogic().clearGameData();
	router.replace({ name: routeName.home });
}
</script>

<template>
	<GameResultScreen @new-game="onNewGame" />
</template>

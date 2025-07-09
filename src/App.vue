<script setup lang="ts">
import { RouterView } from 'vue-router';

import { useBottomSheet } from '@/composables/useBottomSheet';

const { isBottomSheetOpen } = useBottomSheet();
</script>

<template>
	<main :class="{ 'has-open-bottom-sheet': isBottomSheetOpen }">
		<RouterView />
	</main>
</template>

<style lang="scss" scoped>
main {
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
}

.has-open-bottom-sheet {
	border-radius: get-spacing(small);
	overflow: hidden;
	transform: scale(0.95) translateY(1vh);
}
</style>

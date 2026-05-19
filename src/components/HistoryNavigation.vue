<script setup lang="ts">
const emit = defineEmits<{
	'go-back': [];
	'go-forward': [];
}>();

defineProps<{
	canGoBack: boolean;
	canGoForward: boolean;
}>();

/* ========================================================================== */

function onGoBack(): void {
	emit('go-back');
}

function onGoForward(): void {
	emit('go-forward');
}
</script>

<template>
	<div class="history-navigation">
		<button
			:disabled="!canGoBack"
			type="button"
			@click="onGoBack"
		>
			◁
		</button>
		<button
			:disabled="!canGoForward"
			type="button"
			@click="onGoForward"
		>
			▷
		</button>
	</div>
</template>

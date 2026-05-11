<script setup lang="ts">
import { ref } from 'vue';

import ToggleButton from '@/components/ToggleButton.vue';

/* ========================================================================== */

const emit = defineEmits<{ confirmed: [] }>();

/* ========================================================================== */

const understood = ref<boolean>(false);

/* -------------------------------------------------------------------------- */

function onConfirmed(): void {
	understood.value = false;
	emit('confirmed');
}

function onUnderstoodToggled(value: boolean): void {
	understood.value = value;
}
</script>

<template>
	<div class="panel">
		<toggle-button
			:allow-wrap="true"
			:is-selected="understood"
			@toggle="onUnderstoodToggled"
		>
			{{ $t('gameReset.warning') }}
		</toggle-button>

		<button
			:disabled="!understood"
			@click="onConfirmed"
		>
			{{ $t('gameReset.resetLabel') }}
		</button>
	</div>
</template>

<style scoped lang="scss">
.panel {
	display: flex;
	flex-direction: column;
	gap: get-spacing(small);
}
</style>

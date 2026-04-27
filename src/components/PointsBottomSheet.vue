<script setup lang="ts">
import BottomSheet from '@/components/BottomSheet.vue';
import NumberDisplay from '@/components/NumberDisplay.vue';
import NumberInput from '@/components/NumberInput.vue';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'cancel'): void;
	(event: 'close'): void;
}>();

const model = defineModel<number>();

defineProps<{
	/**
	 * Controls the visibility of the BottomSheet component. If set to true,
	 * the BottomSheet will be displayed; if false, it will be hidden.
	 */
	open?: boolean;

	playerName?: string;
}>();

/* -------------------------------------------------------------------------- */

function onCancel(): void {
	emit('cancel');
}

function onClose(): void {
	emit('close');
}
</script>

<template>
	<BottomSheet
		:open
		@close="onCancel"
	>
		<template #header>
			<header class="sheet-header">
				<button
					class="bar-button"
					type="button"
					@click="onCancel"
				>
					Cancel
				</button>
				<h2 class="title">
					{{ playerName }}
				</h2>
				<button
					class="bar-button"
					type="button"
					@click="onClose"
				>
					Save
				</button>
			</header>
		</template>

		<NumberDisplay :value="model" />
		<NumberInput v-model="model" />
	</BottomSheet>
</template>

<style scoped lang="scss">
.bar-button {
	background: none;
	padding: get-spacing(x-small) get-spacing();
}

.sheet-header {
	align-items: center;
	display: flex;
	justify-content: space-between;
	gap: get-spacing(small);
	padding: get-spacing(x-small) 0;
}

.title {
	@include truncate-text;

	color: var(--color-title);
	line-height: 1;
	margin: 0;
}
</style>

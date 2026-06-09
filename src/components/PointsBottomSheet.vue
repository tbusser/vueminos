<script setup lang="ts">
import BottomSheet from '@/components/BottomSheet.vue';
import NumberDisplay from '@/components/NumberDisplay.vue';
import NumberInput from '@/components/NumberInput.vue';
import { ref, watch } from 'vue';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'cancel'): void;
	(event: 'save', points?: number): void;
}>();

const props = defineProps<{
	initialPoints?: number;

	/**
	 * Controls the visibility of the BottomSheet component. If set to true,
	 * the BottomSheet will be displayed; if false, it will be hidden.
	 */
	open?: boolean;

	/**
	 * The name of the player who is collecting points.
	 */
	playerName?: string;
}>();

/* -------------------------------------------------------------------------- */

const collectedPoints = ref<number | undefined>(props.initialPoints);

/* -------------------------------------------------------------------------- */

// When the sheet is opened, ensure the collected points are set to the
// initial points.
watch(() => props.open, value => {
	if (!value) return;

	collectedPoints.value = props.initialPoints;
});

/* -------------------------------------------------------------------------- */

function onCancel(): void {
	emit('cancel');
}

function onClose(): void {
	emit('save', collectedPoints.value);
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
					{{ $t('common.cancel') }}
				</button>
				<h2 class="title">
					{{ playerName }}
				</h2>
				<button
					class="bar-button"
					type="button"
					@click="onClose"
				>
					{{ $t('common.save') }}
				</button>
			</header>
		</template>

		<NumberDisplay :value="collectedPoints" />
		<NumberInput v-model="collectedPoints" />
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

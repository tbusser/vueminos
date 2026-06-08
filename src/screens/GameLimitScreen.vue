<script setup lang="ts">
import { ref } from 'vue';

import BaseScreen from '@/components/BaseScreen.vue';
import MessageBox from '@/components/MessageBox.vue';
import NumberDisplay from '@/components/NumberDisplay.vue';
import NumberInput from '@/components/NumberInput.vue';

import { useGameLogic } from '@/composables/useGameLogic';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'navigate-back'): void;
	(event: 'navigate-forward', limit: number): void;
}>();

const props = withDefaults(
	defineProps<{
		/**
		 * The default limit for a game. When not specified, it defaults to 400.
		 */
		defaultLimit?: number;
	}>(),
	{ defaultLimit: 400 }
);

/* -------------------------------------------------------------------------- */

const { isValidLimit } = useGameLogic();

/* -------------------------------------------------------------------------- */

const limit = ref<number | undefined>(props.defaultLimit);

/* -------------------------------------------------------------------------- */

function onNavigateBack() {
	emit('navigate-back');
}

function onNavigateForward() {
	if (!isValidLimit(limit.value)) return;

	emit('navigate-forward', limit.value);
}
</script>

<template>
	<BaseScreen :title="$t('gameLimit.title')">
		<MessageBox>
			{{ $t('gameLimit.description') }}
		</MessageBox>

		<NumberDisplay :value="limit" />
		<NumberInput
			v-model="limit"
			:show-clear="true"
		/>

		<template #primary-action>
			<button
				type="button"
				@click="onNavigateForward"
			>
				{{ $t('common.next') }}
			</button>
		</template>

		<template #secondary-action>
			<button
				type="button"
				@click="onNavigateBack"
			>
				{{ $t('common.back') }}
			</button>
		</template>
	</BaseScreen>
</template>

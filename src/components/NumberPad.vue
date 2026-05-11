<script setup lang="ts">
export type KeyValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'backspace' | 'clear';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'input', value: KeyValue): void;
}>();

defineProps<{
	/**
	 * Optional prop to toggle the visibility of the clear button. By default,
	 * it is not shown.
	 */
	showClear?: boolean;
}>();

/* -------------------------------------------------------------------------- */

function onKeyClicked(event: Event) {
	const target = event.target as HTMLButtonElement;
	const value = target.dataset.value;

	if (value === 'backspace') {
		emit('input', 'backspace');
	} else if (value === 'clear') {
		emit('input', 'clear');
	} else if (value) {
		emit('input', Number(value) as KeyValue);
	}
}
</script>

<template>
	<div
		class="key-pad"
		@click="onKeyClicked"
	>
		<button
			data-value="1"
			class="key"
		>
			1
		</button>
		<button
			data-value="2"
			class="key"
		>
			2
		</button>
		<button
			data-value="3"
			class="key"
		>
			3
		</button>
		<button
			data-value="4"
			class="key"
		>
			4
		</button>
		<button
			data-value="5"
			class="key"
		>
			5
		</button>
		<button
			data-value="6"
			class="key"
		>
			6
		</button>
		<button
			data-value="7"
			class="key"
		>
			7
		</button>
		<button
			data-value="8"
			class="key"
		>
			8
		</button>
		<button
			data-value="9"
			class="key"
		>
			9
		</button>

		<template v-if="showClear">
			<button
				data-value="clear"
				class="key is-function-key"
				:aria-label="$t('numberPad.clearLabel')"
			>
				{{ $t('numberPad.clearSymbol') }}
			</button>
		</template>

		<button
			data-value="0"
			class="key"
			:class="{ 'in-center': !showClear}"
		>
			0
		</button>
		<button
			data-value="backspace"
			class="key is-function-key"
			:aria-label="$t('numberPad.deleteLabel')"
		>
			⌫
		</button>
	</div>
</template>

<style lang="scss" scoped>
.key-pad {
	display: grid;
	font-size: 1.5em;
	grid-auto-rows: auto;
	grid-template-columns: repeat(3, 1fr);
	gap: get-spacing();
	justify-items: center;
}

.key {
	aspect-ratio: 1 / 1;
	border-radius: 50%;
	width: 60px;

	&.is-function-key {
		background-color: transparent;
	}

	&.in-center {
		grid-column: 2;
	}
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGlobalI18n } from '@/i18n';

import BaseScreen from '@/components/BaseScreen.vue';
import MessageBox from '@/components/MessageBox.vue';
import PlayerSelect from '@/components/PlayerSelect.vue';
import TextInput from '@/components/TextInput.vue';

import { usePlayerManager } from '@/composables/usePlayerManager';

// https://github.com/drag-drop-touch-js/dragdroptouch?tab=readme-ov-file

/* ========================================================================== */

/**
 * Emits when the user wants to proceed to the next step in the player
 * setup flow.
 * @event navigate-forward
 */
const emit = defineEmits<{
	(e: 'navigate-forward'): void;
}>();

/* -------------------------------------------------------------------------- */

const { t } = useGlobalI18n();

const {
	addNewPlayer,
	deletePlayer,
	hasExceededMaximum,
	hasPlayers,
	hasReachedMaximum,
	hasReachedMinimum,
	hasValidNumberOfActivePlayers,
	players
} = usePlayerManager();

const name = ref('');
const nameValidationErrorMessage = ref<string | undefined>(undefined);
const validationError = ref<string | undefined>(undefined);

watch(name, () => {
	nameValidationErrorMessage.value = undefined;
	validationError.value = undefined;
});

/* -------------------------------------------------------------------------- */

function onAddPlayer(event: Event) {
	event.preventDefault();

	const result = addNewPlayer(name.value);

	if (!result.success) {
		nameValidationErrorMessage.value = result.message;
		return;
	}

	name.value = '';
}

function onContinue() {
	if (!hasReachedMinimum.value) {
		validationError.value = t('gamePlayers.errorTooFewPlayers');
		return;
	}

	if (hasExceededMaximum.value) {
		validationError.value = t('gamePlayers.errorTooManyPlayers');
		return;
	}

	validationError.value = undefined;

	emit('navigate-forward');
}

function onDeletePlayer(id: Id) {
	deletePlayer(id);
}
</script>

<template>
	<BaseScreen :title="$t('gamePlayers.title')">
		<MessageBox>
			{{ $t('gamePlayers.description') }}
		</MessageBox>

		<form
			autocomplete="off"
			autocorrect="off"
			class="form"
			@submit="onAddPlayer"
		>
			<TextInput
				id="new-player-name"
				v-model="name"
				:disabled="hasReachedMaximum"
				:hide-label="true"
				:placeholder="$t('gamePlayers.namePlaceholder')"
			>
				{{ $t('gamePlayers.nameLabel') }}
				<template #after-input>
					<button
						type="submit"
						:disabled="hasReachedMaximum"
					>
						{{ $t('gamePlayers.addLabel') }}
					</button>
				</template>
			</TextInput>

			<MessageBox
				v-if="nameValidationErrorMessage"
				type="warning"
			>
				{{ nameValidationErrorMessage }}
			</MessageBox>
		</form>

		<section>
			<h2 v-if="hasPlayers">
				{{ $t('gamePlayers.playersLabel') }}
			</h2>
			<ol>
				<li
					v-for="player in players"
					:key="player.id"
				>
					<PlayerSelect
						:player="player"
						@delete="onDeletePlayer($event)"
					/>
				</li>
			</ol>
		</section>

		<MessageBox
			v-if="validationError"
			type="warning"
		>
			{{ validationError }}
		</MessageBox>

		<template #primary-action>
			<button
				:disabled="!hasValidNumberOfActivePlayers"
				@click="onContinue"
			>
				{{ $t('common.next') }}
			</button>
		</template>
	</BaseScreen>
</template>

<style lang="scss" scoped>
.form {
	display: flex;
	flex-direction: column;
}
</style>

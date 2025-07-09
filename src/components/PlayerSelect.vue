<script setup lang="ts">
import { useGlobalI18n } from '@/i18n';

/* ========================================================================== */

const emit = defineEmits<{
	( e: 'delete', id: Id ): void;
}>();

const props = defineProps<{
	player: Player;
}>();

/* -------------------------------------------------------------------------- */

const { t } = useGlobalI18n();

/* -------------------------------------------------------------------------- */

function onDelete() {
	if (!confirm(t('messages.confirmRemovePlayer', [props.player.name]))) return;

	emit('delete', props.player.id);
}
</script>

<template>
	<article v-if="player" class="player">
		<div class="name">
			{{ player.name }}
		</div>
		<button @click="onDelete">
			{{ $t('common.remove') }}
		</button>
	</article>
</template>

<style lang="scss" scoped>
.player {
	align-items: stretch;
	display: flex;
	justify-content: space-between;
	gap: get-spacing();
}

.name {
	@include truncate-text;

	padding: get-spacing(x-small) 0;
}
</style>

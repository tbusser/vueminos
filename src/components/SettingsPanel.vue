<script setup lang="ts">
import { storeToRefs } from 'pinia';

import ColorSchemeSelect from '@/components/ColorSchemeSelect.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';

import { useSettingsStore } from '@/stores/settings';

/* ========================================================================== */

const settingsStore = useSettingsStore();
const { colorScheme, locale } = storeToRefs(settingsStore);
</script>

<template>
	<div class="section-wrapper">
		<section>
			<ColorSchemeSelect v-model="colorScheme" />
		</section>

		<section>
			<LanguageSelect v-model="locale" />
		</section>
	</div>
</template>

<style lang="scss" scoped>
.section-wrapper {
	display: flex;
	flex-direction: column;
	gap: 20px;
}
</style>

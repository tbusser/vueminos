<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import ColorSchemeSelect from '@/components/ColorSchemeSelect.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';

import { useSettingsStore, type ColorScheme } from '@/stores/settings';

/* ========================================================================== */

const settingsStore = useSettingsStore();
const { colorScheme, locale } = storeToRefs(settingsStore);
const { setColorScheme, setLocale } = settingsStore;

const selectedLocale = ref(locale.value);
const selectedScheme = ref<ColorScheme | undefined>(colorScheme.value);

/* -------------------------------------------------------------------------- */

watch(selectedLocale, newValue => setLocale(newValue));

watch(selectedScheme, newValue => setColorScheme(newValue));
</script>

<template>
	<div class="section-wrapper">
		<section>
			<ColorSchemeSelect v-model="selectedScheme" />
		</section>

		<section>
			<LanguageSelect v-model="selectedLocale" />
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

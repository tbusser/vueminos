<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import BaseScreen from '@/components/BaseScreen.vue';
import ColorSchemeSelect from '@/components/ColorSchemeSelect.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';

import { useSettingsStore, type ColorScheme } from '@/stores/settings';

/* ========================================================================== */

const emit = defineEmits<{
	(event: 'navigate-back'): void;
}>();

/* -------------------------------------------------------------------------- */

const settingsStore = useSettingsStore();
const { colorScheme, locale } = storeToRefs(settingsStore);
const { setColorScheme, setLocale } = settingsStore;

const selectedLocale = ref(locale.value);
const selectedScheme = ref<ColorScheme | undefined>(colorScheme.value);

/* -------------------------------------------------------------------------- */

watch(selectedLocale, newValue => setLocale(newValue));

watch(selectedScheme, newValue => setColorScheme(newValue));

/* -------------------------------------------------------------------------- */

function onNavigateBack() {
	emit('navigate-back');
}
</script>

<template>
	<BaseScreen :title="$t('settingsView.title')">
		<section>
			<ColorSchemeSelect v-model="selectedScheme" />
		</section>

		<section>
			<LanguageSelect v-model="selectedLocale" />
		</section>

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

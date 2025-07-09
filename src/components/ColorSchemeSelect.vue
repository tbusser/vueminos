<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';

import { useGlobalI18n } from '@/i18n';

import SelectField, { type SelectOption } from '@/components/SelectField.vue';

import { type ColorScheme } from '@/stores/settings';

/* ========================================================================== */

const model = defineModel<ColorScheme | undefined>();

const { t } = useGlobalI18n();

const options: ComputedRef<SelectOption[]> = computed(() => ([
	{
		label: t('settingsView.themeAuto'),
		selected: model.value === undefined,
		value: undefined
	},
	{
		label: t('settingsView.themeDark'),
		selected: model.value === 'dark',
		value: 'dark'
	},
	{
		label: t('settingsView.themeLight'),
		selected: model.value === 'light',
		value: 'light'
	}
]));
</script>

<template>
	<SelectField id="color-scheme-select" v-model="model" :options="options">
		{{ $t('settingsView.labelColorScheme') }}
	</SelectField>
</template>

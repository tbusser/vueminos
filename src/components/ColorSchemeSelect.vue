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
		id: 'auto',
		label: t('colorSchemeSelect.themeAuto'),
		selected: model.value === undefined,
		value: undefined
	},
	{
		id: 'dark',
		label: t('colorSchemeSelect.themeDark'),
		selected: model.value === 'dark',
		value: 'dark'
	},
	{
		id: 'light',
		label: t('colorSchemeSelect.themeLight'),
		selected: model.value === 'light',
		value: 'light'
	}
]));
</script>

<template>
	<SelectField
		id="color-scheme-select"
		v-model="model"
		:options="options"
	>
		{{ $t('colorSchemeSelect.title') }}
	</SelectField>
</template>

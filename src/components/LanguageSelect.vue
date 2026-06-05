<script setup lang="ts">
import { computed } from 'vue';
import SelectField, { type SelectOption } from '@/components/SelectField.vue';
import { useGlobalI18n, type Locale } from '@/i18n';

/* ========================================================================== */

const model = defineModel<Locale | undefined>();

const { t } = useGlobalI18n();

const options = computed<SelectOption[]>(() => [
	{
		id: 'auto',
		label: t('languageSelect.languageAuto'),
		selected: model.value === undefined,
		value: undefined
	},
	{
		id: 'en',
		label: t('languageSelect.languageEnglish'),
		selected: model.value === 'en',
		value: 'en' satisfies Locale
	},
	{
		id: 'nl',
		label: t('languageSelect.languageDutch'),
		selected: model.value === 'nl',
		value: 'nl' satisfies Locale
	}
]);
</script>

<template>
	<SelectField
		id="language-select"
		v-model="model"
		:options
	>
		{{ $t('languageSelect.title') }}
	</SelectField>
</template>

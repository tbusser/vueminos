<script setup lang="ts">
import { computed } from 'vue';
import SelectField, { type SelectOption } from '@/components/SelectField.vue';
import { useGlobalI18n } from '@/i18n';

/* ========================================================================== */

const model = defineModel<string | undefined>();

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
		value: 'en'
	},
	{
		id: 'nl',
		label: t('languageSelect.languageDutch'),
		selected: model.value === 'nl',
		value: 'nl'
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

<script setup lang="ts">
import { computed } from 'vue';
import SelectField, { type SelectOption } from '@/components/SelectField.vue';

/* ========================================================================== */

const model = defineModel();

const options = computed<SelectOption[]>(() => [
	{
		id: 'auto',
		label: 'Auto',
		selected: model.value === undefined,
		value: undefined
	},
	{
		id: 'en',
		label: 'English',
		selected: model.value === 'en',
		value: 'en'
	},
	{
		id: 'nl',
		label: 'Dutch',
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
		{{ $t('settingsView.labelLanguage') }}
	</SelectField>
</template>

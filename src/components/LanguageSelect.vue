<script setup lang="ts">
import { computed } from 'vue';
import SelectField, { type SelectOption } from '@/components/SelectField.vue';

/* ========================================================================== */

const model = defineModel();

const options = computed<SelectOption[]>(() => [
	{
		label: 'Auto',
		selected: model.value === undefined,
		value: undefined
	},
	{
		label: 'English',
		selected: model.value === 'en',
		value: 'en'
	},
	{
		label: 'Dutch',
		selected: model.value === 'nl',
		value: 'nl'
	}
]);
</script>

<template>
	<SelectField id="language-select" v-model="model" :options>
		{{ $t('settingsView.labelLanguage') }}
	</SelectField>
</template>

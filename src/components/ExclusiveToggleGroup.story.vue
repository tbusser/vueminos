<script setup lang="ts">
import { reactive } from 'vue';
import ExclusiveToggleGroup from './ExclusiveToggleGroup.vue';

/* ========================================================================== */

const options = [
	{
		id: 'option1',
		label: 'Option 1',
		value: 'option1'
	},
	{
		id: 'option2',
		label: 'Option 2',
		value: 'option2'
	},
	{
		id: 'option3',
		label: 'Option 3',
		value: 'option3'
	}
];

const state = reactive({
	value: undefined
});

</script>

<template>
	<Story title="Exclusive Toggle Group">
		<Variant title="default">
			<ExclusiveToggleGroup v-model="state.value" :options />
		</Variant>

		<Variant title="Custom label rendering">
			<ExclusiveToggleGroup v-model="state.value" :options tag="ul">
				<template #default="{ option }">
					<li>
						<label :for="option.id" class="exclusive-toggle-group__label">
							{{ option.checked }}
							<span class="exclusive-toggle-group__text">custom {{ option.label }}</span>
						</label>
					</li>
				</template>
			</ExclusiveToggleGroup>
		</Variant>
	</Story>
</template>

<script setup lang="ts">
// import { reactive } from 'vue';
import FooterBar from './FooterBar.vue';

/* ========================================================================== */

</script>

<template>
	<Story title="Components/Footer Bar">
		<Variant title="default">
			<FooterBar />
		</Variant>

		<Variant title="primary only">
			<FooterBar>
				<template #primary>
					<div>Primary</div>
				</template>
			</FooterBar>
		</Variant>

		<Variant title="secondary only">
			<FooterBar>
				<template #secondary>
					<div>Secondary</div>
				</template>
			</FooterBar>
		</Variant>

		<Variant title="primary and secondary">
			<FooterBar>
				<template #primary>
					<div>Primary</div>
				</template>
				<template #secondary>
					<div>Secondary</div>
				</template>
			</FooterBar>
		</Variant>
	</Story>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	type?: 'info' | 'warning'
}>(), {
	type: 'info',
});
</script>

<template>
	<article class="message" :class="{ 'is-warning': type === 'warning' }">
		<slot />
	</article>
</template>

<style lang="scss" scoped>
.message {
	background-color: var(--color-informative);
	color: #fdf6e3;
	padding: get-spacing(x-small);

	&.is-warning {
		background-color: var(--color-warning);
	}
}
</style>
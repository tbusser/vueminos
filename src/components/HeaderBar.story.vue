<script setup lang="ts">
import { reactive } from 'vue';
import HeaderBar from './HeaderBar.vue';

/* ========================================================================== */

const state = reactive({
	subtitle: '',
	title: 'Title',
});
</script>

<template>
	<Story title="Components/Header Bar">
		<HeaderBar :subtitle="state.subtitle" :title="state.title"/>
	</Story>
</template>
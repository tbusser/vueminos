<script setup lang="ts">
import SettingsScreen from '@/screens/SettingsScreen.vue';
import { useNavigation } from '@/composables/useNavigation';

/* ========================================================================== */

const { safeNavigateBack } = useNavigation();

/* -------------------------------------------------------------------------- */

function onNavigateBack() {
	safeNavigateBack();
}
</script>

<template>
	<SettingsScreen @navigate-back="onNavigateBack" />
</template>

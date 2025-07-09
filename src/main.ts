import './assets/main.scss';

import { createApp, watch } from 'vue';
import { createPinia, storeToRefs } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';

import { i18n } from '@/i18n';

import App from './App.vue';
import { router } from './router';
import { useSettingsStore } from './stores/settings';
import { useColorScheme } from './composables/useColorScheme';

/* ========================================================================== */

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

app.use(pinia);
app.use(i18n);
app.use(router);

app.mount('#app');

/* ========================================================================== */

const settings = useSettingsStore();
const { colorScheme, locale } = storeToRefs(settings);

watch(locale, selectedLocale => {
	i18n.global.locale = selectedLocale ?? i18n.global.fallbackLocale;
}, {
	immediate: true
});

useColorScheme(colorScheme);

import './assets/main.scss';

import { createApp, watch, type Ref } from 'vue';
import { createPinia, storeToRefs } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';

import { i18n, type Locale } from '@/i18n';

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
	const validLocale: Locale = (selectedLocale === 'en' || selectedLocale === 'nl')
		? selectedLocale
		: 'en';
	(i18n.global.locale as unknown as Ref<Locale>).value = validLocale;
}, {
	immediate: true
});

useColorScheme(colorScheme);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/vueminos/sw.js');

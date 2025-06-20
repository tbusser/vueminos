import { defineSetupVue3 } from '@histoire/plugin-vue';
import { i18n } from './src/i18n';

import './src/assets/main.scss';

/* ========================================================================== */

export const setupVue3 = defineSetupVue3(({ app }) => {
	app.use(i18n);
});

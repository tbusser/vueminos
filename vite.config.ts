import { fileURLToPath, URL } from 'node:url';

import { defineConfig, UserConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import mkcert from 'vite-plugin-mkcert';

/* ========================================================================== */

// https://vite.dev/config/
export default defineConfig({
	assetsInclude: ['**/*.ttf'],

	base: '/vueminos/',

	plugins: [
		vue(),
		vueDevTools(),
		mkcert({
			savePath: './ssl'
		})
	],

	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@components': fileURLToPath(new URL('./src/components', import.meta.url)),
			'@composables': fileURLToPath(new URL('./src/composables', import.meta.url))
		}
	},

	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
				additionalData: `
					@use "/src/assets/css/02-tools/functions/_index.scss" as *;
					@use "/src/assets/css/02-tools/mixins/_index.scss" as *;
				`
			}
		}
	}
}) satisfies UserConfig;

import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

/* ========================================================================== */

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import mkcert from 'vite-plugin-mkcert';

/* ========================================================================== */

// https://vite.dev/config/
export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(version),
		__BUILD_TIMESTAMP__: Date.now()
	},

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
				additionalData: `
					@use "/src/assets/css/02-tools/functions/_index.scss" as *;
					@use "/src/assets/css/02-tools/mixins/_index.scss" as *;
				`
			}
		}
	}
});

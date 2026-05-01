import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import mkcert from 'vite-plugin-mkcert';

/* ========================================================================== */

type PackageJson = {
	version: string;
};

/* ========================================================================== */

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as PackageJson;

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
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},

	build: {
		rolldownOptions: {
			output: {
				manualChunks(id) {
					// Move all packages from node_modules into a single
					// vendor chunk.
					if (id.includes('/node_modules/')) return 'vendor';
				}
			}
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

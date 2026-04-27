import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

import viteConfig from './vite.config';

/* ========================================================================== */

const vitestConfig = {
	test: {
		browser: {
			enabled: true,
			instances: [
				{ browser: 'chromium' }
			],
			provider: playwright()
		},
		exclude: [...configDefaults.exclude, 'e2e/**'],
		root: fileURLToPath(new URL('./', import.meta.url))
	}
};

export default defineConfig(mergeConfig(viteConfig, vitestConfig));

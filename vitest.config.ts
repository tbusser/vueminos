import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';

import viteConfig from './vite.config';

/* ========================================================================== */

const vitestConfig = {
	test: {
		environment: 'jsdom',
		exclude: [...configDefaults.exclude, 'e2e/**'],
		globals: true,
		root: fileURLToPath(new URL('./', import.meta.url))
	}
};

export default defineConfig(mergeConfig(viteConfig, vitestConfig));

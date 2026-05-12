import stylistic from '@stylistic/eslint-plugin';
import pluginVitest from '@vitest/eslint-plugin';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

/* ========================================================================== */

export default [
	globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

	...defineConfigWithVueTs(
		// Enable the strongly recommended rules for Vue.
		pluginVue.configs['flat/strongly-recommended'],

		// Enable the recommended rules for TypeScript.
		vueTsConfigs.recommended
	),

	// Configure the unused-imports plugin to autofix unused imports.
	{
		name: 'app/unused-imports',

		files: ['**/*.{ts,mjs,mts,vue}'],

		plugins: {
			'unused-imports': pluginUnusedImports
		},

		rules: {
			// Disable the standard rule in favor of the unused-imports plugin.
			'@typescript-eslint/no-unused-vars': 'off',

			// Enable the unused-imports plugin, these can be autofixed by
			// the plugin.
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': ['error', {
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
				ignoreRestSiblings: true,
				caughtErrors: 'none',
				destructuredArrayIgnorePattern: '^_'
			}]
		}
	},

	// Configure the Vitest plugin to lint test files.
	{
		...pluginVitest.configs.recommended,
		name: 'app/vitest',
		files: ['src/**/*.test.ts']
	},

	// Configure the stylistic plugin to lint source files.
	{
		name: 'app/stylistic',

		files: ['**/*.{ts,mts,tsx,vue}'],

		plugins: {
			'@stylistic': stylistic
		},

		rules: {
			...stylistic.configs.recommended.rules,

			'@stylistic/arrow-parens': ['error', 'as-needed'],
			'@stylistic/brace-style': ['error', '1tbs'],
			'@stylistic/indent-binary-ops': ['error', 'tab'],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/eol-last': ['error', 'always'],
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/linebreak-style': ['error', 'unix'],
			'@stylistic/max-len': ['error', {
				code: 120,
				comments: 80,
				ignoreTemplateLiterals: true,
				ignoreTrailingComments: true,
				ignoreUrls: true,
				tabWidth: 4
			}],
			'@stylistic/member-delimiter-style': ['error'],
			'@stylistic/no-tabs': ['error', { allowIndentationTabs: true }],
			'@stylistic/object-curly-spacing': ['error', 'always'],
			'@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
			'@stylistic/quote-props': ['error', 'as-needed'],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/space-infix-ops': ['error'],
			'@stylistic/spaced-comment': ['error', 'always', { exceptions: ['|'] }],
			'@stylistic/type-annotation-spacing': ['error'],
			'vue/attributes-order': ['error'],
			'vue/block-order': ['error', {
				order: ['script:not([setup])', 'script', 'template', 'style']
			}],
			'vue/html-indent': ['error', 'tab'],
			'vue/v-on-event-hyphenation': ['error']
		}
	}
];

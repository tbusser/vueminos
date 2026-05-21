import vueI18n from '@intlify/eslint-plugin-vue-i18n';
import * as jsoncParser from 'jsonc-eslint-parser';
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

	// Rules that inspect how i18n is called in source files.
	{
		name: 'app/vue-i18n/source',
		files: ['src/**/*.{vue,ts,mts}'],
		plugins: { '@intlify/vue-i18n': vueI18n },
		rules: {
			'@intlify/vue-i18n/no-i18n-t-path-prop': 'error',
			'@intlify/vue-i18n/no-missing-keys': 'error',
			'@intlify/vue-i18n/no-unused-keys': 'error',
			'@intlify/vue-i18n/no-v-html': 'error'
		},
		settings: { 'vue-i18n': { localeDir: 'src/i18n/*.json' } }
	},

	// Rules for locale JSON files, uses a JSON parser so TS rules don't
	// bleed into the JSON files.
	{
		name: 'app/vue-i18n/locales',
		files: ['src/i18n/**/*.json'],
		plugins: { '@intlify/vue-i18n': vueI18n },
		languageOptions: { parser: jsoncParser },
		rules: {
			'@intlify/vue-i18n/key-format-style': ['error', 'camelCase'],
			'@intlify/vue-i18n/no-html-messages': 'error',
			'@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
			'@intlify/vue-i18n/prefer-linked-key-with-paren': 'error',
			'@intlify/vue-i18n/valid-message-syntax': 'error'
		},
		settings: {
			'vue-i18n': {
				localeDir: 'src/i18n/*.json',
				messageSyntaxVersion: '^11.0.0'
			}
		}
	},

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
			'@stylistic/operator-linebreak': ['error', 'after', {
				overrides: { '?': 'before', ':': 'before', '|': 'before' }
			}],
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
	},

	// General TypeScript source rules.
	{
		name: 'app/source',
		files: ['src/**/*.{ts,mts,vue}'],
		rules: {
			'@typescript-eslint/no-shadow': 'error'
		}
	}
];

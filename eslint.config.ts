import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import stylistic from '@stylistic/eslint-plugin';
import pluginVue from 'eslint-plugin-vue';
import pluginVitest from '@vitest/eslint-plugin';

export default [
	{
		name: 'app/files-to-lint',
		files: ['**/*.{ts,mts,tsx,vue}']
	},

	globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

	...defineConfigWithVueTs(
		pluginVue.configs['flat/essential'],
		vueTsConfigs.recommended
	),

	{
		...pluginVitest.configs.recommended,
		files: ['src/**/__tests__/*']
	},

	{
		name: 'app/stylistic',
		...stylistic.configs.recommended,

		rules: {
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
			'@stylistic/object-curly-spacing': ['error', 'always'],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/space-infix-ops': ['error'],
			'@stylistic/type-annotation-spacing': ['error']
		}
	}
];

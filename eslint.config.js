import antfu from '@antfu/eslint-config'

export default antfu({
	solid: true,
	typescript: true,
	ignores: ['**/bindings.ts'],
}, {
	ignores: ['**/bindings.ts'],
	rules: {
		// for some reason this rules is not working
		// when listed as general rule.
		'ts/consistent-type-imports': [
			'error',
			{
				prefer: 'type-imports',
				fixStyle: 'inline-type-imports',
			},
		],
	},
},
{
	rules: {
		
		'test/consistent-test-it': 'off',
		'ts/array-type': ['error', { default: 'generic', readonly: 'generic' }],
		'ts/consistent-type-definitions': ['error', 'type'],
		'ts/indent': 'off',
		'style/no-tabs': 'off',
		'style/indent': ['error', 'tab'],
		'ts/no-redeclare': 'off',
		'style/jsx-indent-props': ['error', 'tab'],
		'style/jsx-indent': ['error', 'tab'],
		'style/arrow-parens': ['error', 'always'],
		'curly': ['error', 'all'],
		'indent': 'off',
		'antfu/consistent-list-newline': 'off',
	},
})

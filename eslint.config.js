import antfu from '@antfu/eslint-config'

export default antfu({
	stylistic: {
		indent: 'tab',
	},

	ignores: [
		'src-tauri',
	],
}, {
	rules: {
		'ts/array-type': ['error', { default: 'generic', readonly: 'generic' }],
		'ts/consistent-type-definitions': ['error', 'type'],
		'ts/indent': 'off',
		'style/indent': 'off',
		'style/quote-props': ['error', 'as-needed'],
		'arrow-parens': ['error', 'always'],
		'quote-props': ['error', 'as-needed'],
		curly: ['error', 'all'],
		indent: 'off',
		'antfu/consistent-list-newline': 'off',
	},
})

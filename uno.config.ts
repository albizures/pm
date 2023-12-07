import { defineConfig,
	presetIcons,
	presetUno,
	transformerVariantGroup,
} from 'unocss'

export default defineConfig({
	content: {
		pipeline: {
			include: [
				/\.ui\.ts$/,
				/\.html$/,
			],
		},
	},
	presets: [
		presetUno(),
		presetIcons({
			collections: {
				icons: () => import('@iconify-json/material-symbols-light/icons.json').then((i) => i.default as any),
			},
		}),
	],
	transformers: [
		transformerVariantGroup(),
	],
	extendTheme(theme) {
		return {
			...theme,
			colors: {
				black: '#fff',
				transparent: 'transparent',
				current: 'currentColor',
				primary: {
					DEFAULT: 'rgba(var(--c-primary))',
					// active: 'var(--c-primary-active)',
					content: 'rgba(var(--c-primary-content))',
				},
				secondary: {
					DEFAULT: 'var(--c-secondary)',
					active: 'var(--c-secondary-active)',
					content: 'var(--c-secondary-content)',
				},
				neutral: {
					DEFAULT: 'var(--c-neutral)',
					active: 'var(--c-neutral-active)',
					content: 'var(--c-neutral-content)',
				},
				base: {
					100: 'rgba(var(--c-base-100), var(--un-bg-opacity))',
					200: 'var(--c-base-200)',
					300: 'rgba(var(--c-base-300), var(--un-bg-opacity))',
				},
			},
		}
	},
	shortcuts: [{
		'full-expand': 'fixed inset-0 w-full h-full',
		'flex-full-center': 'content-center items-center justify-center',

		// controls
		'control-base': 'sqr-3 cursor-default flex-full-center self-center rounded-full border border-black/[.12] text-center text-black/60 active:text-black/60 dark:border-none',

	}, [/^sqr-(.*)$/, ([, c]) => `aspect-square h-${c} w-${c}`]],
})

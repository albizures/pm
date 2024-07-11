import { shortcuts } from '@vyke/tailwind-shortcuts'
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [
		require('daisyui'),
		shortcuts([
			['size', (value) => `h-${value} w-${value}`, (theme) => theme('spacing')],
		]),
	],
}

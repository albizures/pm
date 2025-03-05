import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

const host = process.env.TAURI_DEV_HOST

// https://astro.build/config
export default defineConfig({
	devToolbar: {
		enabled: false,
	},
	vite: {
		clearScreen: false,

		server: {
			port: 4321,
			strictPort: true,
			host: host || false,
			hmr: host
				? {
						protocol: 'ws',
						host,
						port: 1421,
					}
				: undefined,
			watch: {
				// 3. tell vite to ignore watching `src-tauri`
				ignored: ['**/src-tauri/**'],
			},
		},

		plugins: [tailwindcss()],
	},
})

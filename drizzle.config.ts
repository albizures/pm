import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	out: './src-tauri/migrations',
	schema: './src/schemas/*.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: ':memory:',
	},
	verbose: false,
	strict: true,
})

/* eslint-disable antfu/no-top-level-await */
import { resourceDir } from '@tauri-apps/api/path'
import { readDir, readTextFile } from '@tauri-apps/plugin-fs'
import Database from '@tauri-apps/plugin-sql'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import { rootSola } from './logger'
import * as schema from './schemas'

const sola = rootSola.withTag('db')

const sqlite = await Database.load('sqlite:pm2.db')
await migrate()

type SelectResult = Array<Record<string, unknown>>

export const db = drizzle(async (sql, params, method) => {
	if (!isSelectQuery(sql)) {
		const result = await sqlite.select(sql, params).catch((e) => {
			sola.error('SQL Error:', e)
			sola.error('SQL:', sql)
			sola.error('Params:', params)
			sola.error('Method:', method)
			return []
		}) as SelectResult

		return { rows: result.map((row) => Object.values(row)) }
	}

	const selectResult = await sqlite.select(sql, params).catch((e) => {
		sola.error('SQL Error:', e)
		sola.error('SQL:', sql)
		sola.error('Params:', params)
		sola.error('Method:', method)
		return []
	}) as SelectResult

	const rows = selectResult.map((row: any) => {
		return Object.values(row)
	})

	// If the method is "all", return all rows
	const results = method === 'all' ? rows : [rows[0]]

	return { rows: results }
}, { schema, logger: false, casing: 'snake_case' })

/**
 * Checks if the given SQL query is a SELECT query.
 * @param sql The SQL query to check.
 * @returns True if the query is a SELECT query, false otherwise.
 */
function isSelectQuery(sql: string): boolean {
	const selectRegex = /^\s*SELECT\b/i
	return selectRegex.test(sql)
}

type Migration = {
	name: string
	hash: string
	created_at: number
}

export async function migrate() {
	const resourcePath = await resourceDir()
	const files = await readDir(`${resourcePath}/migrations`)
	let migrations = files.filter((file) => file.name?.endsWith('.sql'))

	// sort migrations by the first 4 characters of the file name
	migrations = migrations.sort((a, b) => {
		const aHash = a.name?.replace('.sql', '').slice(0, 4)
		const bHash = b.name?.replace('.sql', '').slice(0, 4)

		if (aHash && bHash) {
			return aHash.localeCompare(bHash)
		}

		return 0
	})

	const migrationTableCreate = /* sql */ `
		CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			hash text NOT NULL UNIQUE,
			created_at numeric
		)
	`

	await sqlite.execute(migrationTableCreate)
	const dbMigrations = (await sqlite.select(
		/* sql */ `SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC`,
	)) as unknown as Array<Migration>

	sola.debug('Migrations already applied', dbMigrations)

	for (const migration of migrations) {
		sola.debug('Migrating', migration.name)
		const hash = migration.name.replace('.sql', '')

		if (hash && hasBeenRun(dbMigrations, hash) === undefined) {
			sola.debug('Applying migration', migration.name)
			const sql = await readTextFile(`${resourcePath}/migrations/${migration.name}`)

			sqlite.execute(sql)
			sqlite.execute(
				/* sql */ `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
				[hash, Date.now()],
			)
		}
	}

	sola.info('Migrations complete')

	return Promise.resolve()
}

function hasBeenRun(dbMigrations: Array<Migration>, hash: string) {
	return dbMigrations.find((dbMigration) => {
		return dbMigration?.hash === hash
	})
}

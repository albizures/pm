import type { Maybe } from './error'
import Database from '@tauri-apps/plugin-sql'
import { maybe, unwrap } from './error'

let db: Database | null = null

export async function useDb(): Promise<Maybe<Database>> {
	if (db) {
		return maybe(db)
	}

	db = await Database.load('sqlite:pm2.db')

	return maybe(db)
}

export const DB = {
	execute: async (sql: string, ...params: Array<any>) => {
		const db = await unwrap(useDb())
		const result = await db.execute(sql, params)

		return maybe(result)
	},
	select: async (sql: string, ...params: Array<any>) => {
		const db = await unwrap(useDb())
		const result = await db.select(sql, params)

		return maybe(result)
	},
}

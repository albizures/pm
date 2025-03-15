import { sql } from 'drizzle-orm'
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const projectsTable = sqliteTable('projects', {
	id: int().primaryKey({ autoIncrement: true }),
	repoUrl: text().unique(),
	name: text().notNull(),
	description: text().notNull(),
	tags: text().notNull(),
	createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})

export const projectFoldersTable = sqliteTable('project_folders', {
	id: int().primaryKey({ autoIncrement: true }),
	projectId: int().notNull(),
	path: text().notNull(),
	hasChanges: integer({ mode: 'boolean' }).notNull().default(false),
	diskUsage: int().notNull().default(0),
	createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text().notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})

import type { LoaderSignal } from '@vyke/taggy'
import type { Maybe } from '../../error'
import type { FoundProject, Project, ProjectFolder } from './project'
import { loadSignal } from '@vyke/taggy'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db'
import { assert, expect, maybe, to, unwrap } from '../../error'
import { rootSola } from '../../logger'
import { projectFoldersTable, projectsTable } from '../../schemas'
import { stringToJSONSchema } from '../../utils/zod'

const sola = rootSola.withTag('project-queries')

const projectById = new Map<number, Project>()
const projectByRepoUrl = new Map<string, Project>()

const dbProjectFolderSchema = z.object({
	id: z.number(),
	projectId: z.number(),
	path: z.string(),
	diskUsage: z.number(),
	hasChanges: z.boolean(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

type DbProject = {
	id: number
	repoUrl: string | null
	name: string
	description: string
	tags: string
	createdAt: string
	updatedAt: string
}

export type ProjectTag = z.infer<typeof projectTagSchema>
const projectTagSchema = z.enum([
	'nodejs',
	'rust',
	'elixir',
	'gleam',
	'python',
	'git',
	'erlang',
	'denojs',
	'godot',
])

const dbProjectSchema = z.object({
	id: z.number(),
	repoUrl: z.string().nullable(),
	name: z.string(),
	description: z.string(),
	tags: stringToJSONSchema.pipe(z.array(projectTagSchema)),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
}).transform((data): Project => ({
	...data,
	repoUrl: data.repoUrl ?? undefined,
}))

export async function getAllProjectFolders(): Promise<Maybe<Array<ProjectFolder>>> {
	const found = await db.select().from(projectFoldersTable)

	const projectFolders: Array<ProjectFolder> = []

	for (const item of found) {
		const folder = await to(parseProjectFolderFromResult([item]))

		if (!folder.ok || !folder.value) {
			sola.error('Error parsing project folder, skipping', item)
			continue
		}

		const project = await to(getProjectById(item.projectId))

		if (!project.ok || !project.value) {
			sola.error('Error getting project, skipping', item.projectId)
			continue
		}

		projectFolders.push({
			...folder.value,
			project: project.value,
		})
	}

	return maybe(projectFolders)
}

export async function getAllProjects(): Promise<Maybe<Array<Project>>> {
	const found = await db.select().from(projectsTable)

	return parseManyProjectsFromResult(found)
}

export async function getProjectById(id: number): Promise<Maybe<Project | undefined>> {
	const cachedProject = projectById.get(id)

	if (cachedProject) {
		return maybe(cachedProject)
	}

	const found = await db.select().from(projectsTable).where(eq(projectsTable.id, id))

	sola.debug('getProjectById', found)

	return parseProjectFromResult(found)
}

export async function getProjectByRepoUrl(repoUrl: string): Promise<Maybe<Project | undefined>> {
	const cachedProject = projectByRepoUrl.get(repoUrl)
	if (cachedProject) {
		return maybe(cachedProject)
	}

	const found = await db.select().from(projectsTable).where(eq(projectsTable.repoUrl, repoUrl))

	return parseProjectFromResult(found)
}

export async function getProjectFolderByPath(path: string): Promise<Maybe<ProjectFolder | undefined>> {
	const found = await db.select().from(projectFoldersTable).where(eq(projectFoldersTable.path, path))

	return parseProjectFolderFromResult(found)
}

export async function getProjectFoldersByProjectId(projectId: number): Promise<Maybe<Array<ProjectFolder>>> {
	const found = await db.select().from(projectFoldersTable).where(eq(projectFoldersTable.projectId, projectId))

	return parseManyProjectFoldersFromResult(found)
}

const foldersByProjectId = new Map<number, LoaderSignal<Array<ProjectFolder>, Array<ProjectFolder>>>()

export function getFoldersByProjectId(projectId: number): LoaderSignal<Array<ProjectFolder>, Array<ProjectFolder>> {
	const cached = foldersByProjectId.get(projectId)

	if (cached) {
		return cached
	}

	const $folders = loadSignal(async () => {
		const folders = await to(getProjectFoldersByProjectId(projectId))

		if (folders.ok) {
			return folders.value
		}

		return []
	}, { initialValue: [] as Array<ProjectFolder> })

	foldersByProjectId.set(projectId, $folders)

	return $folders
}

export async function createProject(data: FoundProject): Promise<Maybe<Project | undefined>> {
	const result = await db.insert(projectsTable).values({
		name: data.name,
		repoUrl: data.repoUrl,
		description: data.description,
		tags: JSON.stringify(data.tags),
	}).returning()

	return parseProjectFromResult(result)
}

export async function createProjectFolder(data: FoundProject, project: Project): Promise<Maybe<ProjectFolder>> {
	const result = await db.insert(projectFoldersTable).values({
		projectId: project.id,
		path: data.path,
		diskUsage: data.diskUsage,
		hasChanges: data.hasChanges,
	}).returning()

	assert(result.length === 1, 'Error creating project folder')

	const folder = await to(parseProjectFolderFromResult([result[0]]))

	assert(folder.ok && folder.value, 'Error creating project folder')

	return maybe({
		...folder.value,
		project,
	})
}

export async function updateProjectFolder(id: number, data: Partial<ProjectFolder>): Promise<Maybe<void>> {
	await db.update(projectFoldersTable).set({
		...data,
		createdAt: data.createdAt?.toISOString(),
		updatedAt: data.updatedAt?.toISOString(),
	}).where(eq(projectFoldersTable.id, id))

	return maybe(undefined)
}

export async function updateProject(id: number, data: Partial<Project>): Promise<Maybe<void>> {
	await db.update(projectsTable).set({
		...data,
		...data.tags
			? { tags: JSON.stringify(data.tags) }
			: { tags: undefined },
		createdAt: data.createdAt?.toISOString(),
		updatedAt: data.updatedAt?.toISOString(),
	}).where(eq(projectsTable.id, id))

	return maybe(undefined)
}

export async function deleteProjectFolder(id: number): Promise<Maybe<void>> {
	await db.delete(projectFoldersTable).where(eq(projectFoldersTable.id, id))

	return maybe(undefined)
}

export async function deleteProject(id: number): Promise<Maybe<void>> {
	await db.delete(projectsTable).where(eq(projectsTable.id, id))

	return maybe(undefined)
}

// #region Helpers
function parseProjectFromResult(result: Array<DbProject>): Maybe<Project | undefined> {
	if (!result || result.length === 0) {
		return maybe(undefined)
	}

	const project = dbProjectSchema.parse(result[0])

	registerProject(project)

	return maybe(project)
}

async function parseManyProjectsFromResult(result: Array<DbProject>): Promise<Maybe<Array<Project>>> {
	if (!result || result.length === 0) {
		return maybe([])
	}

	const projects: Array<Project> = []

	for (const item of result) {
		const project = expect(() => parseProjectFromResult([item]))

		if (!project) {
			sola.error('Error parsing project, skipping', item)
			continue
		}

		projects.push(project)
	}

	return maybe(projects)
}

async function parseManyProjectFoldersFromResult(result: Array<unknown>): Promise<Maybe<Array<ProjectFolder>>> {
	if (!result || result.length === 0) {
		return maybe([])
	}

	const projectFolders: Array<ProjectFolder> = []

	for (const item of result) {
		const projectFolder = await to(parseProjectFolderFromResult([item]))

		if (!projectFolder.ok || !projectFolder.value) {
			sola.error('Error parsing project folder, skipping', item)
			continue
		}
		// TODO: Check if the project folder is already in the project folders array
		// TODO: Track project folder instances

		projectFolders.push(projectFolder.value)
	}

	return maybe(projectFolders)
}

async function parseProjectFolderFromResult(result: Array<unknown>): Promise<Maybe<ProjectFolder | undefined>> {
	if (!result || result.length === 0) {
		return maybe(undefined)
	}

	const projectFolder = dbProjectFolderSchema.parse(result[0])

	const project = await unwrap(getProjectById(projectFolder.projectId))

	if (!project) {
		sola.error('Error getting project, skipping', projectFolder.projectId)
		return maybe(undefined)
	}

	return maybe({
		...projectFolder,
		project,
	})
}

function registerProject(project: Project) {
	projectById.set(project.id, project)
	if (project.repoUrl) {
		projectByRepoUrl.set(project.repoUrl, project)
	}
}

// #endregion

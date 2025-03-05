import type { DirEntry } from '@tauri-apps/plugin-fs'
import type { Maybe } from '../../error'
import { z } from 'zod'
import { maybe, to, unwrap } from '../../error'
import { rootSola } from '../../logger'
import { getDiskUsage, getFileMetadata, getFilesIn } from '../../utils/files'
import { hasChanges } from '../../utils/git'
import { stringToJSONSchema } from '../../utils/zod'
import { getGitProjectName, isGitProject } from './git'
import { getGleamProjectName, isGleamProject } from './gleam'
import { isGodotProject } from './godot'
import { getDenoJsProjectName, getNodeJsProjectName, isDenoJsProject, isNodeJsProject } from './javascript'
import { getRustProjectName, isRustProject } from './rust'

const sola = rootSola.withTag('project')

export type ProjectTag = z.infer<typeof projectTagSchema>
export const projectTagSchema = z.enum([
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

export type Project = z.infer<typeof projectSchema>
export const projectSchema = z.object({
	id: z.number(),
	name: z.string(),
	path: z.string(),
	description: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	tags: stringToJSONSchema.pipe(z.array(projectTagSchema)),
	diskUsage: z.number(),
	hasChanges: z.string().transform((value) => value === 'true'),
})

type IsProjectTag = (files: Array<DirEntry>) => boolean
type NameGetter = (path: string) => Promise<Maybe<string | undefined>>

const tagChecks: Array<[IsProjectTag, ProjectTag]> = [
	[isNodeJsProject, 'nodejs'],
	[isDenoJsProject, 'denojs'],
	[isRustProject, 'rust'],
	[isGleamProject, 'gleam'],
	[isGitProject, 'git'],
	[isGodotProject, 'godot'],
]

type ProjectNameGetters = Record<ProjectTag, NameGetter>

async function defaultNameGetter() {
	return maybe(undefined)
}

const nameGetters: ProjectNameGetters = {
	nodejs: getNodeJsProjectName,
	denojs: getDenoJsProjectName,
	rust: getRustProjectName,
	gleam: getGleamProjectName,
	git: getGitProjectName,
	elixir: defaultNameGetter,
	python: defaultNameGetter,
	erlang: defaultNameGetter,
	godot: defaultNameGetter,
} as const

export async function getProjectTags(dir: DirEntry): Promise<Maybe<Array<ProjectTag>>> {
	if (dir.isFile) {
		sola.debug('no tags found for', dir.name, 'because it is a file')
		return maybe([])
	}

	const files = await unwrap(getFilesIn(dir.name))

	const tags: Array<ProjectTag> = []

	for (const [isProject, tag] of tagChecks) {
		if (isProject(files)) {
			tags.push(tag)
		}
	}

	sola.debug('found tags', tags, 'for', dir.name)
	return maybe(tags)
}

export async function getProjectName(path: string, tags: Array<ProjectTag>): Promise<Maybe<string>> {
	for (const tag of tags) {
		const getter = nameGetters[tag]
		const name = await to(getter(path))
		if (name.ok && name.value) {
			return maybe(name.value)
		}
	}

	return maybe(path.split('/').pop() ?? 'Unknown')
}

export async function findProjectsIn(path: string): Promise<Maybe<Array<Project>>> {
	sola.debug('finding projects in', path)
	const files = await unwrap(getFilesIn(path))
	const projects: Array<Project> = []

	for (const file of files) {
		const projectResult = await to(getProjectFromDir(file))

		if (!projectResult.ok) {
			sola.error('error getting project from dir', file.name, projectResult.error)
			continue
		}

		if (projectResult.value) {
			projects.push(projectResult.value)
			continue
		}

		if (file.isDirectory) {
			const foundProjects = await to(findProjectsIn(file.name))
			if (foundProjects.ok) {
				projects.push(...foundProjects.value)
			}
			else {
				sola.error('error getting projects from dir', file.name, foundProjects.error)
			}
		}
	}

	return maybe(projects)
}

export async function getProjectFromDir(dir: DirEntry): Promise<Maybe<Project | undefined>> {
	const tags = await unwrap(getProjectTags(dir))

	if (tags.length !== 0) {
		return maybe({
			id: -1,
			name: await unwrap(getProjectName(dir.name, tags)),
			tags,
			path: dir.name,
			description: '',
			createdAt: new Date(),
			updatedAt: new Date(),
			diskUsage: await unwrap(getDiskUsage(dir.name)),
			hasChanges: tags.includes('git')
				? await unwrap(hasChanges(dir.name))
				: false,
		})
	}

	return maybe(undefined)
}

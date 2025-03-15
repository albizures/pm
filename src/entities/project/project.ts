import type { DirEntry } from '@tauri-apps/plugin-fs'
import type { Signal } from '@vyke/taggy/signals'
import type { Maybe } from '../../error'
import type { ProjectTag } from './project-queries'
import { maybe, to, unwrap, unwrapOr } from '../../error'
import { rootSola } from '../../logger'
import { getDiskUsage, getFilesIn } from '../../utils/files'
import { getRemoteUrl, hasChanges } from '../../utils/git'
import { getRepoMetadata, isGitHubRepo } from '../../utils/github'
import { getGitProjectName, isGitProject } from './git'
import { getGleamProjectName, isGleamProject } from './gleam'
import { isGodotProject } from './godot'
import { getDenoJsProjectName, getNodeJsProjectName, isDenoJsProject, isNodeJsProject } from './javascript'
import { getRustProjectName, isRustProject } from './rust'

const sola = rootSola.withTag('project')

export type $Project = Signal<Project>
export type Project = {
	id: number
	repoUrl?: string
	name: string
	description: string
	tags: Array<ProjectTag>
	createdAt: Date
	updatedAt: Date
}

export type ProjectFolder = {
	id: number
	path: string
	createdAt: Date
	updatedAt: Date
	project: Project
	diskUsage: number
	hasChanges: boolean
}

export type $ProjectFolder = Signal<ProjectFolder>

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

const skipFolders = [
	'node_modules',
	'.git',
	'.vscode',
	'.idea',
	'.DS_Store',
	'.venv',
	'.godot',
]

export async function findProjectsIn(path: string): Promise<Maybe<Array<FoundProject>>> {
	sola.debug('finding projects in', path)
	const files = await unwrap(getFilesIn(path))
	const projects: Array<FoundProject> = []

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

		const isSkipFolder = skipFolders.some((folder) => file.name.endsWith(folder))

		if (file.isDirectory && !isSkipFolder) {
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

export type FoundProject = {
	repoUrl: string | undefined
	name: string
	tags: Array<ProjectTag>
	path: string
	description: string
	diskUsage: number
	hasChanges: boolean
}

export async function getProjectFromDir(dir: DirEntry): Promise<Maybe<FoundProject | undefined>> {
	const tags = await unwrap(getProjectTags(dir))

	// having at least one tag means it's a project
	if (tags.length !== 0) {
		const repoUrl = await unwrapOr(getRemoteUrl(dir.name), undefined)
		const repoMetada = await (isGitHubRepo(repoUrl) ? unwrapOr(getRepoMetadata(repoUrl), undefined) : undefined)

		return maybe({
			repoUrl,
			name: repoMetada?.repo.name ?? await unwrap(getProjectName(dir.name, tags)),
			tags,
			path: dir.name,
			description: repoMetada?.repo.description ?? '',
			diskUsage: await unwrap(getDiskUsage(dir.name)),
			hasChanges: tags.includes('git')
				? await unwrap(hasChanges(dir.name))
				: false,
		})
	}

	return maybe(undefined)
}

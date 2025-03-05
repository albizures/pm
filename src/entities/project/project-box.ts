import type { ReadSignal, Signal } from '@vyke/taggy/signals'
import type { Maybe } from '../../error'
import type { Project } from './project'
import { computed, signal } from '@vyke/taggy/signals'
import { differenceInMinutes } from 'date-fns'
import { z } from 'zod'
import { DB } from '../../db'
import { maybe, to, unwrap } from '../../error'
import { rootSola } from '../../logger'
import { exists, pathInRoot } from '../../utils/files'
import { parseArray } from '../../utils/zod'
import { findProjectsIn, getProjectFromDir, projectSchema } from './project'

const sola = rootSola.withTag('project')
const selectResultSchema = z.array(projectSchema)

function createProjectBox() {
	const projectsById = new Map<number, Signal<Project>>()
	const $projects = signal<Array<Signal<Project>>>([])
	const $scanning = signal(false)

	async function load() {
		// let's reset the projects first
		$projects([])

		const data = await DB.select('SELECT * FROM projects')

		parseArray({
			data,
			schema: projectSchema,
			handleError(value, error) {
				sola.error('Trying to parse project', value)
				sola.error('Resulted in error', error)
			},
			handleItem(item) {
				const $project = signal(item)
				$projects([...$projects(), $project])

				addToSyncQueue($project)
			},
		})

		if ($projects().length === 0) {
			await scanProjects()

			return
		}

		return $projects()
	}

	async function addProject(data: Project) {
		// check if the project already exists using the path
		const found = await to(DB.select(`SELECT * FROM projects WHERE path = $1`, data.path))

		if (found.ok) {
			const parsed = selectResultSchema.parse(found.value)

			if (parsed.length > 0) {
				sola.info('Project already exists', data.path)

				const project = signal(parsed[0])
				$projects([...$projects(), project])
				return
			}
		}

		const result = await to(
			DB.execute(`INSERT INTO projects (name, path, description, tags, diskUsage, hasChanges, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
				data.name,
				data.path,
				data.description,
				JSON.stringify(data.tags),
				data.diskUsage,
				data.hasChanges,
				data.createdAt,
				data.updatedAt,
			),
		)

		if (!result.ok) {
			sola.error('Failed to add project', result.error, data)
			return
		}

		const { lastInsertId: id } = result.value

		if (!id) {
			sola.error('No id returned from DB when adding project', data)
			return
		}

		data.id = id
		const project = signal(data)
		$projects([...$projects(), project])
	}

	async function syncProject($project: Signal<Project>) {
		if (!await exists($project().path)) {
			// TODO: support removed projects
			sola.warn('Project path does not exist', $project().path)
			return
		}

		// only sync if the project hasn't been synced in the last 5 minutes
		const { updatedAt } = $project()

		if (differenceInMinutes(new Date(), updatedAt) < 5) {
			sola.debug('Project has been synced recently', $project().name)
			return
		}

		const foundProject = await to(getProjectFromDir({
			isDirectory: true,
			name: $project().path,
			isFile: false,
			isSymlink: false,
		}))

		if (foundProject.ok && foundProject.value) {
			DB.execute(
				`UPDATE projects 
					SET updatedAt = $1,
						diskUsage = $2,
						hasChanges = $3
					WHERE id = $4`,
				new Date(),
				foundProject.value.diskUsage,
				foundProject.value.hasChanges,
				$project().id,
			)

			sola.debug('Synced project', $project().name)
		}
	}

	async function getById(id: number): Promise<Maybe<Signal<Project>>> {
		const savedProject = projectsById.get(id)

		if (savedProject) {
			return maybe(savedProject)
		}

		const found = await unwrap(DB.select(`SELECT * FROM projects WHERE id = $1`, id))

		const data = selectResultSchema.parse(found)[0]
		const $project = signal<Project>(data)

		sola.debug('Found project', data)
		projectsById.set(id, $project)
		$projects([...$projects(), $project])
		addToSyncQueue($project)
		return maybe($project)
	}

	function unregisterProject($project: Signal<Project>) {
		DB.execute(`DELETE FROM projects WHERE id = $1`, $project().id)
		projectsById.delete($project().id)
		$projects($projects().filter((project) => project() !== $project()))
	}

	async function scanProjects() {
		$scanning(true)
		const projectsFolder = await unwrap(pathInRoot('projects'))
		const foundProjects = await to(findProjectsIn(projectsFolder))

		if (foundProjects.ok) {
			foundProjects.value.forEach(addProject)
		}

		$scanning(false)
	}

	const $withChanges = computed(() => {
		return $projects().filter((project) => project().hasChanges)
	})

	const box = {
		$projects: $projects as ReadSignal<Array<Signal<Project>>>,
		$scanning: $scanning as ReadSignal<boolean>,
		$withChanges,
		load,
		addProject,
		getById,
		syncProject,
		unregisterProject,
		scanProjects,
	}

	return box
}

export const ProjectBox = createProjectBox()

const syncQueue: Array<Signal<Project>> = []

function addToSyncQueue($project: Signal<Project>) {
	if (syncQueue.includes($project)) {
		return
	}

	syncQueue.push($project)
}

setInterval(() => {
	if (syncQueue.length === 0) {
		return
	}
	const project = syncQueue.shift()

	if (!project) {
		return
	}

	sola.debug('Syncing project', project().name)

	ProjectBox.syncProject(project)
}, 1000)

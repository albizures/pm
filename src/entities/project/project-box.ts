import type { LoaderSignal } from '@vyke/taggy'
import type { ReadSignal } from '@vyke/taggy/signals'
import type { Maybe } from '../../error'
import type { $Project, FoundProject, Project, ProjectFolder } from './project'
import { signal } from '@vyke/taggy/signals'
import { assert, maybe, to, unwrap } from '../../error'
import { rootSola } from '../../logger'

import { pathInRoot } from '../../utils/files'
import { createBox } from '../box'
import { findProjectsIn } from './project'
import {
	createProject,
	createProjectFolder,
	getAllProjects,
	getFoldersByProjectId,
	getProjectById,
	getProjectByRepoUrl,
	getProjectFolderByPath,
} from './project-queries'

const sola = rootSola.withTag('project')

function createProjectBox() {
	const $scanning = signal(false)

	const projectBox = createBox({
		name: 'project',
		getId: (project: Project) => project.id,
	})

	function clear() {
		projectBox.clear()
	}

	async function load() {
		// let's reset the projects first
		clear()

		// load the projects and project folders from the database
		const projects = await unwrap(getAllProjects())

		for (const project of projects) {
			projectBox.add(project)
		}

		// if there are no projects, we need to scan the projects folder
		if (projects.length === 0) {
			await scanFolders()
		}

		return projectBox.$values()
	}

	/**
	 * Adds a project by folder.
	 * This is used when a project is found in the projects folder.
	 * This will create a new project and a new project folder.
	 */
	async function addProjectByFolder(data: FoundProject) {
		// check if the given project already exists using the path from the folder
		const projectFolder = await unwrap(getProjectFolderByPath(data.path))

		if (projectFolder) {
			if (projectBox.$get(projectFolder.project)) {
				return
			}

			sola.info('Found project by folder, storing it', data.path)

			projectBox.add(projectFolder.project)

			return
		}

		// if no project folder is found, create a new project and the folder for it
		const project = await unwrap(createProject(data))
		assert(project, 'Error creating project')
		await unwrap(createProjectFolder(data, project))

		projectBox.add(project)
	}

	async function addProject(data: FoundProject): Promise<Maybe<void>> {
		if (!data.repoUrl) {
			// if there is no repoUrl, the process is different
			addProjectByFolder(data)

			return maybe(undefined)
		}

		// check if the project already exists using repoUrl
		const found = await unwrap(getProjectByRepoUrl(data.repoUrl))
		if (found) {
			// check if the project is already in the project box
			if (!projectBox.$get(found)) {
				// if not, we need to add it to the project box
				projectBox.add(found)
			}

			// check if the project folder exists
			const folder = await unwrap(getProjectFolderByPath(data.path))
			// if it doesn't exist, create it
			if (!folder) {
				await unwrap(createProjectFolder(data, found))
			}

			// now project is in the project box
			return maybe(undefined)
		}

		// if the project is not found, we need to create a new project
		const project = await unwrap(createProject(data))
		assert(project, 'Error creating project')
		// and the folder for it
		await unwrap(createProjectFolder(data, project))

		// and we register both
		projectBox.add(project)

		return maybe(undefined)
	}

	async function getById(id: number): Promise<Maybe<$Project | undefined>> {
		const project = await unwrap(getProjectById(id))

		if (!project) {
			return maybe(undefined)
		}

		// check if the project is already in the project box
		if (projectBox.$get(project)) {
			return maybe(projectBox.$get(project))
		}

		// if the project is not in the project box, we need to add it
		const $project = projectBox.add(project)

		return maybe($project)
	}

	async function scanFolders() {
		$scanning(true)
		// TODO: make this configurable
		const startFolder = await unwrap(pathInRoot('projects'))
		const foundProjects = await to(findProjectsIn(startFolder))

		if (foundProjects.ok) {
			for (const project of foundProjects.value) {
				const result = await to(addProject(project))

				if (!result.ok) {
					sola.error('Error adding project', project)
				}
			}
		}

		$scanning(false)
	}

	function getProjectFoldersByProject($project: $Project): LoaderSignal<Array<ProjectFolder>, Array<ProjectFolder>> {
		const $folders = getFoldersByProjectId($project().id)

		if ($folders().status !== 'loaded') {
			$folders.reload()
		}

		return $folders
	}

	const box = {
		$projects: projectBox.$values as ReadSignal<Array<$Project>>,
		$scanning: $scanning as ReadSignal<boolean>,
		load,
		addProject,
		getById,
		scanFolders,
		getProjectFoldersByProject,
	}

	return box
}

export const ProjectBox = createProjectBox()

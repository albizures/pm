import type { Signal } from '@vyke/taggy/signals'
import type { UncommitedChange } from '../../utils/git'
import type { Project } from './project'
import { signal } from '@vyke/taggy/signals'
import { to } from '../../error'
import { rootSola } from '../../logger'
import { findUncommitedChanges } from '../../utils/git'

const sola = rootSola.withTag('project-metadata')

const metadataByProject = new WeakMap<Signal<Project>, ProjectMetadata>()

type ProjectMetadata = {
	$uncommitedChanges: Signal<Array<UncommitedChange>>
}

export function getUncommitedChanges(project: Signal<Project>): Signal<Array<UncommitedChange>> {
	const metadata = getMetadata(project)

	return metadata.$uncommitedChanges
}

async function syncUncommitedChanges(project: Signal<Project>) {
	const uncommitedChanges = await to(findUncommitedChanges(project().path))

	if (!uncommitedChanges.ok) {
		sola.error('Error loading uncommited changes', uncommitedChanges.error)
	}
	else {
		const metadata = getMetadata(project)
		metadata.$uncommitedChanges = signal(uncommitedChanges.value)
	}
}

function getMetadata(project: Signal<Project>): ProjectMetadata {
	let metadata = metadataByProject.get(project)

	if (!metadata) {
		metadata = {
			$uncommitedChanges: signal([]),
		}

		syncUncommitedChanges(project)
		metadataByProject.set(project, metadata)
	}

	return metadata
}

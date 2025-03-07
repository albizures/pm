import type { LoaderSignal } from '@vyke/taggy'
import type { Signal } from '@vyke/taggy/signals'
import type { UncommitedChange } from '../../utils/git'
import type { Project } from './project'
import { loadSignal } from '@vyke/taggy'
import { unwrap } from '../../error'
import { rootSola } from '../../logger'
import { findUncommitedChanges } from '../../utils/git'

const sola = rootSola.withTag('project-metadata')

const metadataByProject = new WeakMap<Signal<Project>, ProjectMetadata>()

type ProjectMetadata = {
	$uncommitedChanges: LoaderSignal<Array<UncommitedChange>>
}

export function getMetadata(project: Signal<Project>): ProjectMetadata {
	let metadata = metadataByProject.get(project)

	if (!metadata) {
		sola.debug('Creating metadata for project', project().path)
		metadata = {
			$uncommitedChanges: loadSignal(async () => {
				return unwrap(findUncommitedChanges(project().path))
			}),
		}

		metadataByProject.set(project, metadata)
	}

	return metadata
}

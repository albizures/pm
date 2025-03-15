import type { LoaderSignal } from '@vyke/taggy'
import type { UncommitedChange } from '../../utils/git'
import type { ProjectFolder } from './project'
import { loadSignal } from '@vyke/taggy'
import { unwrap } from '../../error'
import { rootSola } from '../../logger'
import { findUncommitedChanges } from '../../utils/git'

const sola = rootSola.withTag('project-metadata')

const metadataByProject = new WeakMap<ProjectFolder, ProjectMetadata>()

type ProjectMetadata = {
	$uncommitedChanges: LoaderSignal<Array<UncommitedChange>>
}

export function getMetadata(folder: ProjectFolder): ProjectMetadata {
	let metadata = metadataByProject.get(folder)

	if (!metadata) {
		sola.debug('Creating metadata for project', folder.path)
		metadata = {
			$uncommitedChanges: loadSignal(async () => {
				return unwrap(findUncommitedChanges(folder.path))
			}),
		}

		metadataByProject.set(folder, metadata)
	}

	return metadata
}

import type { $Project } from '../../entities/project/project'
import { $when } from '@vyke/taggy'
import { computed } from '@vyke/taggy/signals'
import { ProjectBox } from '../../entities/project/project-box'
import { getMetadata } from '../../entities/project/project-metadata'
import { div } from '../../tags'
import { Icon } from '../Icon'

type UncommitedChangesStatProps = {
	$project: $Project
}

export function UncommitedChangesStat(props: UncommitedChangesStatProps) {
	const { $project } = props
	const $folders = ProjectBox.getProjectFoldersByProject($project)

	const $amountOfFolders = computed(() => $folders().$value().length)

	const $amountOfUncommitedChanges = computed(() => {
		let amount = 0
		for (const folder of $folders().$value()) {
			const metadata = getMetadata(folder)
			const uncommitedChanges = metadata.$uncommitedChanges()
			if (uncommitedChanges.status === 'loaded') {
				amount += uncommitedChanges.$value().length
			}
		}

		return amount
	})

	return div({ className: 'stat' }, [
		div({ className: 'stat-figure text-secondary' }, [
			Icon({ name: 'git', className: 'text-lg' }),
		]),
		div({ className: 'stat-title text-center' }, [
			'Uncommited Changes in ',
			$amountOfFolders,
			' folders',
		]),
		div({ className: 'stat-value text-center' }, [
			$amountOfUncommitedChanges,
		]),
		div({ className: 'stat-desc flex justify-center' }, [
			$when(computed(() => $amountOfUncommitedChanges() > 0),
				[true, () => 'There are uncommited changes'],
				[false, () => 'No uncommited changes'],
			),
		]),
	])
}

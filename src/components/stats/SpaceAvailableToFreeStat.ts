import type { $Project } from '../../entities/project/project'
import { $when } from '@vyke/taggy'
import { computed } from '@vyke/taggy/signals'
import { ProjectBox } from '../../entities/project/project-box'
import { button, div } from '../../tags'
import { $prettySize } from '../../utils/files'
import { Icon } from '../Icon'

type SpaceAvailableToFreeProps = {
	$project: $Project
	onFreeSpace?: () => void
}

export function SpaceAvailableToFree(props: SpaceAvailableToFreeProps) {
	const { $project } = props
	const $folders = ProjectBox.getProjectFoldersByProject($project)

	const $amountOfFolders = computed(() => $folders().$value().length)
	const $diskUsage = computed(() => $folders().$value().reduce((acc, folder) => acc + folder.diskUsage, 0))

	return div({ className: 'stat' }, [
		div({ className: 'stat-figure text-secondary' }, [
			Icon({ name: 'disk-usage' }),
		]),
		div({ className: 'stat-title' }, ['Space Available to Free in ', $amountOfFolders, ' folders']),
		div({ className: 'stat-value text-center' }, [
			$prettySize($diskUsage),
		]),
		div({ className: 'stat-desc flex justify-center' }, [
			$when(computed(() => $diskUsage() > 0),
				[true, () => button({
					className: 'btn btn-ghost hover:btn-error hover:text-error-content',
					onclick() {
						props.onFreeSpace?.()
					},
				},
				[
					Icon({ name: 'trash' }),
					'Free Space',
				],
				)],
				[false, () => 'No free space available'],
			),
		]),
	])
}

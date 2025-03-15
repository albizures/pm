import type { Signal } from '@vyke/taggy/signals'
import type { Project } from '../entities/project/project'
import { $list, $when } from '@vyke/taggy'
import { $access, computed } from '@vyke/taggy/signals'
import { $formatDate } from '../date'
import { ProjectBox } from '../entities/project/project-box'
import { rootSola } from '../logger'
import { a, button, div, h1, h4, li, span, ul } from '../tags'
import { $prettySize } from '../utils/files'
import { Icon } from './Icon'

const sola = rootSola.withTag('ProjectCard')

type ProjectCardProps = {
	$project: Signal<Project>
	onToggleTag?: (tag: string) => void
}

export function ProjectCard(props: ProjectCardProps) {
	const { onToggleTag } = props
	const $project = $access(props.$project)
	const $projectFolders = ProjectBox.getProjectFoldersByProject(props.$project)
	const $amountOfFolders = computed(() => $projectFolders().$value().length)
	const $diskUsage = computed(() => $projectFolders().$value().reduce((acc, folder) => acc + folder.diskUsage, 0))
	const href = `/project?id=${$project().id}`

	return div({
		className: 'border border-base-100 px-4 py-2 rounded-lg',
	}, [
		// title
		a({ href }, [
			h1({ className: 'text-lg font-bold' }, [
				$project.name,
			]),
		]),

		// repo url as subtitle
		div({ className: 'opacity-50' }, [
			$when($project.repoUrl,
				$when.case($when.isString, (repoUrl) => a({ href }, [
					h4({ className: 'text-xs text-base-content -mt-1' }, [repoUrl]),
				])),
				$when.otherwise(() => h4({ className: 'text-xs text-base-content -mt-1' }, ['No repo url'])),
			),
		]),

		// top row
		div({ className: 'flex gap-2 items-center justify-between mt-1' }, [
			div({ className: 'flex gap-4' }, [
				span({ className: 'text-xs text-base-content flex items-center gap-1' }, [
					Icon({ name: 'folder', className: 'text-secondary opacity-50' }),
					$amountOfFolders,
				]),
				span({ className: 'text-xs text-base-content flex items-center gap-1' }, [
					Icon({ name: 'disk-usage', className: 'text-secondary opacity-50' }),
					$prettySize($diskUsage),
				]),
			]),

			// tags
			ul({ className: 'flex gap-2' }, [
				$list($project.tags, (tag) => li([
					button({
						className: 'badge badge-dash badge-accent',
						onclick() {
							sola.debug('toggle tag', tag)
							onToggleTag?.(tag)
						},
					}, [
						tag,
					]),
				])),
			]),
		]),

		// bottom row
		div({ className: 'flex gap-2 mt-1' }, [
			span({ className: 'text-xs text-gray-500 flex-1' }, [
				'Updated: ', $formatDate($project.updatedAt, 'time-ago'),
			]),
		]),
	])
}

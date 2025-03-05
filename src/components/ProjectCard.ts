import type { Signal } from '@vyke/taggy/signals'
import type { Project } from '../entities/project/project'
import { $list, $when } from '@vyke/taggy'
import { $access } from '@vyke/taggy/signals'
import { $formatDate } from '../date'
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

	const href = `/project?id=${$project().id}`

	return div({
		className: 'border border-base-100 px-4 py-2 rounded-lg',
	}, [
		// title
		a({ href }, [
			h1({ className: 'text-lg font-bold' }, [$project.name]),
		]),

		// path as subtitle
		a({ href }, [
			h4({ className: 'text-xs text-gray-500 -mt-1' }, [$project().path]),
		]),

		// top row
		div({ className: 'flex gap-2 items-center justify-between mt-1' }, [
			// disk usage and changes
			div({ className: 'flex gap-2' }, [
				span({ className: 'badge badge-info badge-sm badge-soft' }, [
					Icon({ name: 'disk-usage' }),
					$prettySize($project.diskUsage),
				]),
				$when($project.hasChanges,
					[true, () =>
						span({ className: 'badge badge-info badge-sm badge-soft' }, [
							Icon({ name: 'git' }),
							'With Changes',
						]),
					],
					[false, () => ''],
				),
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
		div({ className: 'flex gap-2' }, [
			span({ className: 'text-xs text-gray-500 flex-1' }, [
				'Updated: ', $formatDate($project.updatedAt, 'time-ago'),
			]),
		]),
	])
}

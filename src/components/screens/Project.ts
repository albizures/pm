import type { Signal } from '@vyke/taggy/signals'
import type { Project } from '../../entities/project/project'
import { $list, $when, loadSignal } from '@vyke/taggy'
import { $access } from '@vyke/taggy/signals'
import { $formatDate } from '../../date'
import { ProjectBox } from '../../entities/project/project-box'
import { unwrap } from '../../error'
import { a, button, div, h1, h3, li, p, span, ul } from '../../tags'
import { DeleteAllButton } from '../DeleteAllButton'
import { ExternalLink } from '../ExternalLink'
import { ProjectFolderCard } from '../ProjectFolderCard'
import { SpaceAvailableToFree } from '../stats/SpaceAvailableToFreeStat'
import { UncommitedChangesStat } from '../stats/UncommitedChangesStat'

type ProjectProps = {
	id: number
	previusScreen: string
}

function isProject(value: unknown): value is Project {
	return typeof value === 'object' && value !== null && 'name' in value
}

export function ProjectScreen(props: ProjectProps) {
	const { id, previusScreen } = props
	const $projectLoader = loadSignal(async () => {
		const $project = await unwrap(ProjectBox.getById(id))

		return $project && $project()
	})

	return div([
		div([
			a({ href: previusScreen }, [
				'Go back',
			]),
		]),
		$projectLoader.match({
			loaded: ($project) => $when($project,
				$when.case(isProject, (project: Project) => ProjectPanel({ $project: () => project })),
				$when.otherwise(() => h1(['Project not found'])),
			),
			error: () => h1(['Error loading project', ' ', id, '-']),
			loading: () => h1(['Loading project', ' ', id]),
		}),
	])
}

type ProjectPanelProps = {
	$project: Signal<Project>
}

function isNotEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim() !== ''
}

function ProjectPanel(props: ProjectPanelProps) {
	const { $project } = props
	const $accessProject = $access($project)
	const $folders = ProjectBox.getProjectFoldersByProject($project)

	return div([
		div({ className: 'flex justify-between' }, [
			div({ className: '' }, [
				h1({ className: 'text-2xl font-bold' }, [$accessProject().name]),
				h3([
					$when($accessProject.description,
						$when.case(isNotEmptyString, (description) => description),
						$when.otherwise(() => 'No description'),
					),
				]),
				p([
					$when($accessProject.repoUrl,
						$when.case(isNotEmptyString, (repoUrl) => div([
							span(['Repo Url: ']),
							ExternalLink({ href: repoUrl, children: repoUrl }),
						])),
						$when.otherwise(() => 'No repo url'),
					),
				]),
			]),
			div({ className: 'pr-20 flex gap-2' }, [
				button({ className: 'btn btn-primary' }, [
					'Sync',
				]),
				button({
					className: 'btn btn-ghost hover:btn-error',
					onclick: () => {
						history.back()
					},
				}, [
					'Unregister',
				]),
				DeleteAllButton({ $project, className: 'btn btn-error' }),
			]),
		]),
		div({ className: 'stats shadow' }, [
			SpaceAvailableToFree({ $project }),
			UncommitedChangesStat({ $project }),
		]),
		div({ className: '' }, [
			p([
				'Last updated: ',
				$formatDate($accessProject.updatedAt, 'short-time-ago'),
			]),
			p([
				'Created: ',
				$formatDate($accessProject.createdAt, 'short-time-ago'),
			]),
		]),
		div({ className: 'flex flex-col gap-4 p-4' }, [
			ul({ className: 'flex flex-col gap-2 max-w-3xl' }, [
				$list($folders().$value, (folder) => li([
					ProjectFolderCard({ folder }),
				])),
			]),
		]),
	])
}

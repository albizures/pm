import type { AccessSignal, Signal } from '@vyke/taggy/signals'
import type { Project } from '../../entities/project/project'
import type { UncommitedChange } from '../../utils/git'
import { $list, loadSignal } from '@vyke/taggy'
import { $access, computed, effect, signal } from '@vyke/taggy/signals'
import { $formatDate, formatDate } from '../../date'
import { ProjectBox } from '../../entities/project/project-box'
import { unwrap } from '../../error'
import { a, button, div, h1, li, p, span, ul } from '../../tags'
import { $prettySize, getFileMetadata } from '../../utils/files'
import { findUncommitedChanges } from '../../utils/git'
import { SpaceAvailableToFree } from '../stats/SpaceAvailableToFreeStat'
import { UncommitedChangesStat } from '../stats/UncommitedChangesStat'

type ProjectProps = {
	id: number
	previusScreen: string
}

export function ProjectScreen(props: ProjectProps) {
	const { id, previusScreen } = props
	const $projectLoader = loadSignal(async () => {
		const $project = await unwrap(ProjectBox.getById(id))

		return $project()
	})

	return div([
		div([
			a({ href: previusScreen }, [
				'Go back',
			]),
		]),
		() => $projectLoader().status,
		$projectLoader.match({
			loaded: ($project) => ProjectPanel({ $project }),
			error: () => h1(['Error loading project', ' ', id, '-']),
			loading: () => h1(['Loading project', ' ', id]),
		}),
	])
}

type ProjectPanelProps = {
	$project: Signal<Project>
}

function ProjectPanel(props: ProjectPanelProps) {
	const $project = $access(props.$project)
	const $amountOfUncommitedChanges = signal(0)

	return div([
		div({ className: 'flex justify-between' }, [
			div({ className: '' }, [
				h1({ className: 'text-2xl font-bold' }, [$project().name]),
				p([
					'Path: ',
					$project().path,
				]),
			]),
			div({ className: 'pr-20 flex gap-2' }, [
				button({ className: 'btn btn-primary' }, [
					'Sync',
				]),
				button({
					className: 'btn btn-ghost hover:btn-error',
					onclick: () => {
						ProjectBox.unregisterProject($project)
						history.back()
					},
				}, [
					'Unregister',
				]),
			]),
		]),
		div({ className: 'stats shadow' }, [
			SpaceAvailableToFree({ $diskUsage: $project.diskUsage }),
			UncommitedChangesStat({ $amount: $amountOfUncommitedChanges }),
		]),
		div({ className: '' }, [
			p([
				'Last updated: ',
				$formatDate($project.updatedAt, 'short-time-ago'),
			]),
			p([
				'Created: ',
				$formatDate($project.createdAt, 'short-time-ago'),
			]),
		]),
		div({ className: 'flex flex-col gap-2' }, [
			UncommitedChanges({ $project, $amountOfUncommitedChanges }),
			AvailableFreeSpace({ $project }),
		]),
	])
}

type UncommitedChangeProps = {
	$project: AccessSignal<Project>
	$amountOfUncommitedChanges: Signal<number>
}

function UncommitedChanges(props: UncommitedChangeProps) {
	const { $project, $amountOfUncommitedChanges } = props

	const $uncommitedChangesLoader = loadSignal(async () => {
		return unwrap(findUncommitedChanges($project.path()))
	})

	const $status = computed(() => $uncommitedChangesLoader().status)

	return div([
		h1(['Uncommited changes:']),
		$uncommitedChangesLoader.match({
			loaded: ($uncommitedChanges) => {
				return ul([
					$list($uncommitedChanges, (change) => li([
						UncommitedFile({ change, $project }),
					])),
				])
			},
			error: () => h1(['Error loading uncommited changes']),
			loading: () => h1(['Loading uncommited changes']),
		}),
	])
}

type UncommitedFileProps = {
	$project: AccessSignal<Project>
	change: UncommitedChange
}

function UncommitedFile(props: UncommitedFileProps) {
	const { $project, change } = props

	const $metadataLoader = loadSignal(async () => {
		return unwrap(getFileMetadata(change.path))
	})

	return div({ className: 'flex' }, [
		span([
			change.type, ' - ',
			change.path.replace($project.path(), ''),
		]),
		$metadataLoader.match({
			loaded: ($metadata) =>
				span([
					formatDate($metadata().modifiedAt, 'short-time-ago'),
				]),
			error: ($error) => h1(['Error loading metadata', ' ', `${$error()}`]),
			loading: () => h1(['Loading metadata']),
		}),
	])
}

type AvailableFreeSpaceProps = {
	$project: AccessSignal<Project>
}

function AvailableFreeSpace(props: AvailableFreeSpaceProps) {
	const { $project } = props

	return div([
		h1(['Available free space:']),
		$prettySize($project.diskUsage),
	])
}

import type { Project } from '../../entities/project/project'
import { $list, $when } from '@vyke/taggy'
import { computed, signal } from '@vyke/taggy/signals'
import clsx from 'clsx'
import Fuse from 'fuse.js'
import { ProjectBox } from '../../entities/project/project-box'
import { rootSola } from '../../logger'
import { button, div, input, label, li, span, ul } from '../../tags'
import { Icon } from '../Icon'
import { ProjectCard } from '../ProjectCard'
import { SearchInput } from '../SearchInput'

const sola = rootSola.withTag('Home')

export function Home() {
	ProjectBox.load()

	const fuse = new Fuse([] as Array<Project>, {
		threshold: 0.3,
		keys: ['name', 'repoUrl', 'tags'],
	})

	const $search = signal('')
	const $selectedTags = signal<Array<string>>([])
	const $results = computed(() => {
		const tags = $selectedTags().map((tag) => `=${tag}`).join(' ')
		const searchValue = `${$search()} ${tags}`.trim()
		return fuse.search(searchValue).map((result) => result.item)
	})
	const $withRepo = signal(false)

	function toggleTag(tag: string) {
		$selectedTags($selectedTags().includes(tag) ? $selectedTags().filter((t) => t !== tag) : [...$selectedTags(), tag])
	}

	return div([
		div([
			// header or toolbar
			div({ className: 'flex gap-2 p-4 justify-between' }, [
				div({ className: 'flex gap-2 flex-1 items-center' }, [
					SearchInput({ $value: $search }),
					label({ className: 'text-sm text-gray-500 flex gap-2 items-center' }, [
						input({
							type: 'checkbox',
							checked: $withRepo(),
							className: 'toggle',
							onclick() {
								sola.debug('toggle with changes', $withRepo())
								$withRepo(!$withRepo())
							},
						}),
						span([
							'Only with repo',
						]),
					]),
					div({ className: 'flex gap-2' }, [
						$list($selectedTags, (tag) => button({
							className: 'badge badge-outline badge-secondary',
							onclick() {
								toggleTag(tag)
							},
						}, [
							tag,
							Icon({ name: 'close' }),
						])),
					]),
				]),
				div({ className: 'flex gap-2' }, [
					button({
						className: 'btn btn-secondary btn-soft',
						onclick() {
							ProjectBox.scanFolders()
						},
						disabled: ProjectBox.$scanning(),
					}, [
						$when(ProjectBox.$scanning,
							[true, () => span({ className: 'loading loading-spinner loading-sm' })],
							[false, () => Icon({ name: 'scan' })],
						),
						'Scan Projects',
					]),
				]),
			]),

			// grid of projects
			ul({ className: 'grid grid-cols-2 md:grid-cols-4 gap-4 px-4 pb-4' }, [
				$list(ProjectBox.$projects, ($project) => {
					fuse.add($project())

					const $isHiddenByRepo = computed(() => $withRepo() && !$project().repoUrl)
					const $isHiddenBySearch = computed(() => $results().length > 0 && !$results().includes($project()))

					return li({
						className: computed(() => clsx({
							hidden: $isHiddenByRepo() || $isHiddenBySearch(),
						})),
					}, [
						ProjectCard({ $project, onToggleTag: toggleTag }),
					])
				}),
			]),
		]),
	])
}

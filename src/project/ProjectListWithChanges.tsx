import { For } from 'solid-js'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel } from '@tanstack/solid-table'
import { destructurable } from '@vyke/solid-destructurable'
import type { GitProjectEntry } from '../bindings'
import { IconByTypes } from '../components/Icon'
import { useNavigation } from '../components/StackRoot'

const columnHelper = createColumnHelper<GitProjectEntry>()

const nameCol = columnHelper.accessor(
	(value) => value.project.name,
	{
		id: 'name',
		cell: (props) => <span>{props.getValue()}</span>,
	},
)

const amountChangesCol = columnHelper.accessor(
	(value) => value.changes.length,
	{
		id: 'amountChanges',
		cell: (props) => (
			<span>
				{' - '}
				(
				{props.getValue()}
				)
			</span>
		),
	},
)

const iconTypesCol = columnHelper.accessor(
	(value) => value.project.types,
	{
		id: 'icons-types',
		cell: (props) => {
			return (
				<span class="inline-block mr-2">
					<IconByTypes types={props.getValue()} />
				</span>
			)
		},
	},
)

type ProjectListWithChangesProps = {
	entries: Array<GitProjectEntry>
}

export function ProjectListWithChanges(props: ProjectListWithChangesProps) {
	const navigation = useNavigation()
	const table = createSolidTable({
		columns: [iconTypesCol, nameCol, amountChangesCol],
		get data() {
			return props.entries
		},
		initialState: {
			sorting: [
				{
					id: 'amountChanges',
					desc: true, // sort by name in descending order by default
				},
			],
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	function onOpenProject(entry: GitProjectEntry) {
		navigation.views.project.push({ path: entry.project.path })
	}

	return (
		<div>
			<h3 class="text-3xl">Projects with Changes!</h3>
			<ul class="mt-2 pl-6 list-disc">
				<For each={table.getRowModel().rows}>
					{(row) => (
						<li>
							<Entry onClick={onOpenProject} entry={row.original} />
						</li>
					)}
				</For>
			</ul>
		</div>
	)
}

type EntryProps = {
	entry: GitProjectEntry
	onClick: (entry: GitProjectEntry) => void
}
function Entry(props: EntryProps) {
	const { entry, onClick } = destructurable(props)

	return (
		<button title={entry().project.path} onClick={() => onClick(entry())}>
			<IconByTypes types={entry().project.types} />
			<span class="inline-block ml-2">{entry().project.name}</span>
			<span>
				{' ' }
				(
				{entry().changes.length}
				)
			</span>
		</button>
	)
}

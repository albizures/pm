import { Match, Show, Switch, createResource } from 'solid-js'
import { destructurable } from '@vyke/solid-destructurable'
import { toUnwrap } from '@vyke/results/result'
import type { ProjectType } from '../bindings'
import { git } from '../git/gitCommands'
import { ProjectSection } from '../project/ProjectSection'
import { Icon } from '../components/Icon'
import { formatLastCommitDate } from '../date'
import { InfoRow } from '../components/InfoRow'

type GitDataSectionProps = {
	path: string
	types: Array<ProjectType>
}

export function GitDataSection(props: GitDataSectionProps) {
	const { path, types } = destructurable(props)

	return (
		<Show when={types().includes('Git')}>
			<GitDataSectionContent path={path()} />
		</Show>
	)
}

type GitDataSectionContentProps = {
	path: string
}

function GitDataSectionContent(props: GitDataSectionContentProps) {
	const { path } = destructurable(props)
	const [gitData] = createResource(path, async (path) => {
		return toUnwrap(git.getProjectData(path))
	}, { initialValue: git.defaultProjectData() })

	return (
		<ProjectSection title={(
			<>
				<Icon class="inline-block mr-2" name="Git" />
				Git
			</>
		)}
		>
			<InfoRow
				label={<Label>remote origin</Label>}
				value={<Value value={gitData().remoteOrigin} />}
			/>
			<InfoRow
				label={<Label>changes</Label>}
				value={gitData().changes.length}
			/>
			<InfoRow
				label={<Label>branches</Label>}
				value={<Value value={gitData().branches} />}
			/>
			<InfoRow
				label={<Label>current branch</Label>}
				value={<Value value={gitData().currentBranch?.replace('refs/heads/', '') ?? null} />}
			/>
			<InfoRow
				label={<Label>commit count</Label>}
				value={<Value value={gitData().commitCount} />}
			/>
			<InfoRow
				label={<Label>last commit date</Label>}
				value={<Value value={formatLastCommitDate(gitData().lastCommitDate)} />}
			/>
		</ProjectSection>
	)
}

function Label(props: { children: string }) {
	return (
		<span class="font-bold capitalize">
			{props.children}
		</span>
	)
}

type ValueProps = {
	value: null | Array<string> | string | number
}

function Value(props: ValueProps) {
	return (
		<>
			<Switch fallback={props.value}>
				<Match when={props.value === null}>
					<span>
						None
						<Icon class="inline-block size-6 text-error pl-1 opacity-50" name="alert" />
					</span>
				</Match>
				<Match when={Array.isArray(props.value) && props.value}>
					{(value) => (
						<span>
							{value().slice(0, 3).join(', ')}
							{' '}
							<Show when={value().length > 3}>
								(+
								{value().length - 3}
								)
							</Show>

						</span>
					)}
				</Match>
			</Switch>
		</>
	)
}

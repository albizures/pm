import { For, Match, Show, Switch, createMemo, createResource, createSignal } from 'solid-js'
import { toUnwrap, toUnwrapOr } from '@vyke/results/result'
import { destructurable } from '@vyke/solid-destructurable'
import type { FileEntry } from '@tauri-apps/api/fs'
import { getFileMetadata, getFilesIn } from '../file/fileHelpers'
import { Icon, IconByTypes } from '../components/Icon'
import { useNavigation } from '../components/StackRoot'
import { getProjectTypes } from './projectHelpers'

type Status = 'open' | 'closed'

type ProjectFileTreeProps = {
	path: string
}

export function ProjectFileTree(props: ProjectFileTreeProps) {
	const { path } = destructurable(props)

	const [fileEntries] = createResource(path(), async (path) => {
		return toUnwrapOr(getFilesIn(path), [], console.error)
	})

	return (

		<Switch>
			<Match when={fileEntries.error}>
				<span>
					Error:
					{/* {error()} */}
				</span>
			</Match>
			<Match when={fileEntries()}>
				<ul class="ml-2">
					<For each={fileEntries()}>
						{(entry) => {
							return (
								<File entry={entry} />
							)
						}}
					</For>

				</ul>
			</Match>
		</Switch>
	)
}

type FileProps = {
	entry: FileEntry
}

function File(props: FileProps) {
	const { entry } = destructurable(props)

	const name = createMemo(() => {
		return entry().name ?? entry().path.split('/').pop()!
	})

	const path = createMemo(() => {
		return entry().path
	})

	const [isDir] = createResource(path, async (path) => {
		const metadata = await toUnwrap(getFileMetadata(path))

		return metadata.isDir
	})

	return (
		<Show when={isDir()}>
			<li class="py-0.5 pl-3 border-l-2 border-dashed border-opacity-20 border-l-base-content">
				<Directory path={path()} name={name()} />
			</li>
		</Show>
	)
}

type DirectoryProps = {
	path: string
	name: string
}

export function Directory(props: DirectoryProps) {
	const navigation = useNavigation()
	const { path, name } = destructurable(props)
	const [status, setStatus] = createSignal<Status>('closed')

	const [types] = createResource(path, async (path) => {
		return toUnwrapOr(getProjectTypes(path), [], console.error)
	}, { initialValue: [] })

	const isSupported = createMemo(() => {
		return types().length === 0 || types().includes('Javascript')
	})

	function onClick() {
		if (types().length === 0) {
			setStatus((status) => (status === 'open' ? 'closed' : 'open'))
		}
		else if (isSupported()) {
			navigation.views.project.replace({
				path: path(),
			})
		}
	}

	return (
		<div>
			<button onClick={onClick}>
				<Show when={types().length === 0}>
					<span class="pr-2">
						<Show
							when={status() === 'open'}
							fallback={<Icon name="caret-right" class="size-5 -mr-1 inline-block align-middle" />}
						>
							<Icon name="caret-down" class="size-5 -mr-1 inline-block align-middle" />

						</Show>
					</span>
				</Show>
				<IconByTypes types={types()} />
				{name()}
				{isSupported() ? '' : ' (Not supported)'}
			</button>
			<Show when={status() === 'open' && status.length === 0}>
				<ProjectFileTree path={path()} />
			</Show>
		</div>
	)
}

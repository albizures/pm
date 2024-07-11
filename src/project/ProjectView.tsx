import { destructurable } from '@vyke/solid-destructurable'
import { defineView } from '@vyke/solid-stack'
import { Command } from '@tauri-apps/api/shell'
import { createMemo, createResource } from 'solid-js'
import { toUnwrap, toUnwrapOr } from '@vyke/results/result'
import { Icon, IconByTypes } from '../components/Icon'
import { GitDataSection } from '../git/GitDataSection'
import { LastModifiedFilesSection } from '../file/LastModifiedFilesSection'
import { getProjectName, getProjectTypes } from './projectHelpers'

type ProjectProps = {
	path: string
}

export const ProjectView = defineView('project', (props: ProjectProps) => {
	const { path } = destructurable(props)

	const [types] = createResource(path, async (path) => {
		return toUnwrapOr(getProjectTypes(path), [], console.error)
	}, { initialValue: [] })

	const namePayload = createMemo(() => {
		return { path: path(), types: types() }
	})

	const [name] = createResource(namePayload, async (payload) => {
		return toUnwrap(getProjectName(payload.path, payload.types))
	}, { initialValue: '' })

	function onVSCodeOpen() {
		new Command('open-vscode', [path()]).execute()
	}

	return (
		<div class="p-4">
			<div class="flex justify-between content-center">
				<div class="flex items-center gap-3">
					<h1 class="text-5xl capitalize">
						{name()}
					</h1>
					<button class="opacity-50 hover:opacity-100" onClick={onVSCodeOpen}>
						<span class="sr-only">open in vscode</span>
						<Icon class="size-8" name="external-link" />
					</button>
				</div>
				<div class="flex gap-3">
					<IconByTypes types={types()} includeGit={true} size="xl" />
				</div>
			</div>
			<p class="opacity-40">
				{path()}
			</p>
			<div class="mt-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<GitDataSection path={path()} types={types()} />
					<LastModifiedFilesSection path={path()} />
				</div>
			</div>
		</div>
	)
}).withActions((push, replace) => ({
	push,
	replace,
}))

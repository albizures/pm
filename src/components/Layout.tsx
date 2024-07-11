import { destructurable } from '@vyke/solid-destructurable'
import { type JSX, Show, createResource } from 'solid-js'
import { toUnwrap } from '@vyke/results/result'
import { pathInRoot } from '../file/fileHelpers'
import { Directory } from '../project/ProjectFileTree'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

type LayoutProps = {
	children?: JSX.Element
}

export function Layout(props: LayoutProps) {
	const { children } = destructurable(props)

	const [root] = createResource(async () => {
		return toUnwrap(pathInRoot('projects'))
	})

	return (
		<div class="flex absolute inset-0 left-0 right-0 bg-base-100 border border-base-200 rounded-xl">
			<Sidebar>
				<div>
					<Show when={root()} fallback={<span>loading...</span>}>
						{(root) => <Directory path={root()} name="projects" />}
					</Show>
				</div>
			</Sidebar>
			<div class="flex-1 border-l border-l-base-300 flex flex-col">
				<Topbar />
				<div class="py-2 px-3 overflow-auto flex-1">
					{children()}
				</div>
			</div>
		</div>
	)
}

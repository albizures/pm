import type { JSX } from 'solid-js'
import { appWindow } from '@tauri-apps/api/window'
import { StateFlags, saveWindowState } from 'tauri-plugin-window-state-api'
import { destructurable } from '@vyke/solid-destructurable'

type SidebarProps = {
	children: JSX.Element
}

export function Sidebar(props: SidebarProps) {
	const { children } = destructurable(props)

	async function onClose() {
		saveWindowState(StateFlags.ALL)
		appWindow.close()
	}

	function onMinimize() {
		appWindow.minimize()
	}

	function onMaximize() {
		appWindow.maximize()
	}

	return (
		<div data-tauri-drag-region={true} class="h-full flex flex-col">
			<div class="flex gap-1 px-4 py-4">
				<button onClick={onClose} class="control-base control-close">
					<span class="sr-only">close</span>
				</button>
				<button onClick={onMinimize} class="control-base control-minimize">
					<span class="sr-only">minimize</span>
				</button>
				<button onClick={onMaximize} class="control-base control-maximize">
					<span class="sr-only">maximize</span>
				</button>
			</div>
			<div class="overflow-auto flex-1 px-4">
				{children()}
			</div>
		</div>
	)
}

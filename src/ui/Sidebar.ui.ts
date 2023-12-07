import { appWindow } from '@tauri-apps/api/window'
import { StateFlags, saveWindowState } from 'tauri-plugin-window-state-api'
import { intera } from '../intera/intera'
import { button, div } from '../elements'

export function SideBarAlt() {
	const onClose = intera.click(async () => {
		await saveWindowState(StateFlags.ALL)
		appWindow.close()
	})
	const onMinimize = intera.click(() => appWindow.minimize())
	const onMaximize = intera.click(() => appWindow.maximize())

	return div({
		'data-tauri-drag-region': true,
		style: 'width: 14rem',
		class: 'mx-3 my-3',
	},
		div({ class: 'flex gap-1' },
			button({ [onClose.attrName]: onClose.value, class: 'control-base bg-[#ff544d] hover:bg-[#ff544d] active:bg-[#bf403a]' }),
			button({ [onMinimize.attrName]: onClose.value, class: 'control-base bg-[#ffbd2e] hover:bg-[#ffbd2e] active:bg-[#bf9122]' }),
			button({ [onMaximize.attrName]: onClose.value, class: 'control-base bg-[#28c93f] hover:bg-[#28c93f] active:bg-[#1e9930]' }),
		),
		'sidebar',
	)
}

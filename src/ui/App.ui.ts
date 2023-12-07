import { rootConsola } from '../consola/consola'
import { Fragment, div } from '../elements'
import { SideBarAlt } from './Sidebar.ui'
import { TopBarAlt } from './Topbar.ui'
import { StackContainerAlt } from './View.ui'

const _consola = rootConsola.withTag('app')

export async function AppAlt() {
	return Fragment(
		SideBarAlt(),
		div({ class: 'flex flex-col flex-1 bg-base-300' },
			TopBarAlt(),
			div({ class: 'relative flex-1' },
				await StackContainerAlt({ stackName: 'app' }),
			),
		),
	)
}

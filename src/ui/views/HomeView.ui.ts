import type { StackViewProps } from '../../navigation/navigation'
import { FileTree } from '../FileTree.ui'
import type { NoProps } from '../../component'
import { div } from '../../elements'

export async function HomeView(_props: NoProps, _viewProps: StackViewProps) {
	return div({ class: 'px-4 py-3 overflow-scroll relative full-expand' },
		await FileTree(),
	)
}

import bytes from 'bytes'
import type { StackViewProps } from '../../navigation/navigation'
import { getProjectInfo } from '../../projects/project'
import type { Props } from '../../component'
import { div, h3, li, span, ul } from '../../elements'

type ProjectViewProps = Props<{
	root: string
}>

export async function ProjectView(props: ProjectViewProps, _viewProps: StackViewProps) {
	const { root } = props

	const info = await getProjectInfo(root)

	return div({ class: 'px-4 py-3 overflow-scroll relative full-expand' },
		root,
		div({ class: 'flex flex-col gap-3' },
			await Section({ title: 'General' },
				ul({},
					SectionItem('Path', root),
					SectionItem('Project size', bytes(info.size)),
					SectionItem('VCS Enabled', info.vcsEnabled ? 'Yes' : 'No'),
				),
			),
		),
	)
}

type SectionProps = Props<{
	title: string | Promise<string>
}>

async function Section(props: SectionProps, ...children: Array<Element>) {
	const { title } = props

	return div({ class: 'border p-2 rounded' },
		h3({ class: 'text-xl font-semibold' }, await title),
		...children,
	)
}

function SectionItem(label: string, value: string) {
	return li(
		span({ class: 'font-bold' },
			`${label}: `,
		),
		value,
	)
}

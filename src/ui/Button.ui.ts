import type { Props } from '../component'
import type { HtmlChild } from '../elements'
import { button } from '../elements'
import type { Bind } from '../intera/intera'

type ButtonProps = Props<{
	click: Bind
}>

export function Button(props: ButtonProps, requiredChild: HtmlChild, ...children: Array<HtmlChild>) {
	const { click } = props

	return button({
		class: 'bg-primary text-primary-content rounded px-3 py-2 hover:bg-opacity-90',
		[click.attrName]: click.value,
	},
		requiredChild,
		...children,
	)
}

import clsx from 'clsx'
import { intera } from '../intera/intera'
import { appStack } from '../navigation/stacks'
import type { Props } from '../component'
import { button, div, span } from '../elements'

type NavigationButtonProps = Props<{
	type: 'previous' | 'next'
	click: { attr: string; attrName: string; value: string }
}>

export function TopBarAlt() {
	const onGoNext = intera.click(() => {
		throw new Error('TODO: going next is not supported by the stack')
	})

	const onGoPrevious = intera.click(() => {
		appStack.pop()
	})

	return div({ 'data-tauri-drag-region': true, class: 'px-4 py-3 w-full' },
		div({ class: 'flex pointer-events-none' },
			NavigationButton({
				type: 'previous',
				click: onGoPrevious,
			}),
			NavigationButton({
				type: 'next',
				click: onGoNext,
			}),
		),

	)
}

function NavigationButton(props: NavigationButtonProps) {
	const { type, click } = props

	const className = clsx('inline-block pointer-events-initial', {
		'i-icons-arrow-forward-ios': type === 'next',
		'i-icons-arrow-back-ios': type === 'previous',
	})

	return button({ class: 'py-2 px-1 text-2xl' },
		span({ class: className, [click.attrName]: click.value }),
	)
}

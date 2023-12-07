import type { Bind } from '../intera/intera'
import type { StackViewProps } from '../navigation/navigation'
import { $ } from '../signal'
import { classNames } from '../signal/classNames'
import type { Props } from '../component'
import { type StackName, type Stacks, getStack, stacks } from '../navigation/stacks'
import type { HtmlChild } from '../elements'
import { div } from '../elements'

type ViewStackProps<
	TStackName extends keyof Stacks,
> = {
	stackName: TStackName
}

export async function StackContainerAlt<TStackName extends StackName,
>(props: ViewStackProps<TStackName>) {
	const { stackName } = props
	const stack = getStack(stackName)

	const { content, onMount } = await stack.start()

	return div({
		class: 'absolute full-expand',
		[onMount.attrName]: onMount.value,
		[stack.container.attrName]: stack.container.value,
	},
		await content,
	)
}

type ViewContainerProps = Props<{
	children: HtmlChild
	bind: Bind
}>

export async function ViewStackContainerAlt(props: ViewContainerProps, viewProps: StackViewProps) {
	const { children, bind } = props
	const { stackName, index } = viewProps
	const stack = getStack(stackName)

	const isCurrentView = $.computed(() => {
		return stack.index() === index
	})
	const className = classNames('absolute full-expand top-0', $.if(isCurrentView, 'opacity-100', 'opacity-0'))

	console.log(bind)

	return div({ ...className.attr, [bind.attrName]: bind.value }, children)
}

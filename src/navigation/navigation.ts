import type { Jsonifiable } from 'type-fest'
import type { Bind } from '../intera/intera'
import { intera } from '../intera/intera'
import type { Signal } from '../signal/signal'
import { $ } from '../signal'
import { ViewStackContainerAlt } from '../ui/View.ui'
import { getDevItem, setDevItem } from '../localStorage'
import { consola } from '../consola/consola'
import { Fragment } from '../elements'
import type { StackName } from './stacks'

export type AnyStack = NavigationStack<any, any>

export type StackViewProps = {
	index: number
	stackName: StackName
}

export type StackViews = Record<
	string,
	(props: any, viewProps: StackViewProps) => Promise<Element>
>

export type StackInitial<TView, TProps> = {
	view: TView
	props: TProps
}

type StackStateItem<TView> = { viewName: TView; bind: Bind; props: unknown }

export class NavigationStack<TViews extends StackViews, TInitial extends StackInitial<keyof TViews, any>> {
	name: StackName
	stack: Array<StackStateItem<keyof TViews>>
	container: ReturnType<typeof intera.html>
	index: Signal<number>
	views: TViews
	initial: TInitial
	constructor(name: StackName, views: TViews, initial: TInitial) {
		const oldState = getDevItem(`stack-${name}`) as Array<StackStateItem<keyof TViews>>

		this.name = name
		this.views = views
		this.stack = oldState ?? []
		this.container = intera.html('append', name)
		this.index = $.signal(0)
		this.initial = initial
	}

	async start() {
		const { stack, container, index: stackIndex, initial, name } = this
		if (stack.length === 0) {
			return {
				onMount: { attr: '', value: '', attrName: '' } as unknown as ReturnType<typeof intera.htmlMount>,
				content: this.push(initial.view, initial.props),
			}
		}

		const content = Fragment(
			...await Promise.all(stack.map(async (stackItem) => {
				const index = stack.indexOf(stackItem)
				const { viewName, props, bind } = stackItem

				const viewHtml = await this.render(viewName, props, index, bind)

				intera.emitter.emit(container.name,
					viewHtml.outerHTML,
				)

				return viewHtml
			})),
		)

		// saving it to avoid changes from stack
		const index = stack.length - 1
		const onMount = intera.htmlMount(`${name}-container`)
		consola.log('listening for ', onMount.name)

		intera.emitter.on(onMount.name, () => {
			consola.log('event fire ', onMount.name)
			stackIndex(index)
		})

		return {
			onMount,
			content,
		}
	}

	async render<TViewName extends keyof TViews>(
		viewName: TViewName,
		props: Parameters<TViews[TViewName]>[0],
		index: number,
		bind: Bind,
	) {
		const { name, views } = this
		const view = views[viewName]!
		const viewProps = {
			stackName: name,
			index,
		}

		return ViewStackContainerAlt({
			children: await view(props, viewProps),
			bind,
		}, viewProps)
	}

	createBind(index: number) {
		const { name } = this
		const id = `${name}-${index}`
		return intera.html('swap', id)
	}

	async push<TViewName extends keyof TViews>(
		viewName: TViewName,
		props: Parameters<TViews[TViewName]>[0],
	) {
		const { name, stack, index: stackIndex } = this
		const index = stack.length
		const bind = this.createBind(index)

		stack.push({
			viewName,
			bind,
			props,
		})

		setDevItem(`stack-${name}`, stack as Jsonifiable)

		stackIndex(index)

		const viewHtml = await this.render(viewName, props, index, bind)

		intera.emitter.emit(this.container.name,
			viewHtml.outerHTML,
		)

		return viewHtml
	}

	pop() {
		if (this.stack.length === 1) {
			return
		}

		const view = this.stack.pop()

		if (view) {
			intera.emitter.emit(view.bind.name, '')
			this.index((current) => current - 1)
		}
	}
}

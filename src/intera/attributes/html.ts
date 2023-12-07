import { rootConsola } from '../../consola/consola'
import { append, swap } from '../dom'
import { Attr, type Emitter, getAttrEventName } from './attr'

const consola = rootConsola.withTag('attributes:html')

export function setupHtmlAppendBind(element: HTMLElement, value: string, emitter: Emitter) {
	const eventName = getAttrEventName(Attr.HtmlAppend, value)

	emitter.on(eventName, (value) => {
		append(element, String(value), emitter)
	})
}

export function setupHtmlSwapBind(element: HTMLElement, value: string, emitter: Emitter) {
	const eventName = getAttrEventName(Attr.HtmlSwap, value)

	function eventHandler(value: unknown) {
		emitter.off(eventName, eventHandler)
		swap(element, String(value), emitter)
	}

	emitter.on(eventName, eventHandler)
}

export function setupHtmlMountBind(_element: HTMLElement, value: string, emitter: Emitter) {
	const eventName = getAttrEventName(Attr.HtmlMount, value)

	consola.log('setting up mount', eventName, value)

	emitter.emit(eventName, value)
}

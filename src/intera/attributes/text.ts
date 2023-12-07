import { Attr, type Emitter, getAttrEventName } from './attr'

export function setupTextBind(element: HTMLElement, value: string, emitter: Emitter) {
	const eventName = getAttrEventName(Attr.Text, value)

	emitter.on(eventName, (value) => {
		element.textContent = String(value)
	})
}

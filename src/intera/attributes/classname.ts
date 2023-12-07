import { Attr, type Emitter, getAttrEventName } from './attr'

export function setupClassNameBind(element: HTMLElement, value: string, emitter: Emitter) {
	const eventName = getAttrEventName(Attr.ClassName, value)

	emitter.on(eventName, (value) => {
		element.className = String(value)
	})
}

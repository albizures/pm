import { Attr, type Emitter, getAttrEventName } from './attr'

export function setupClick(element: HTMLElement, value: string, emitter: Emitter) {
	const eventName = getAttrEventName(Attr.Click, value)

	element.addEventListener('click', (event) => {
		emitter.emit(eventName, JSON.stringify(event))
	})
}

import type { Emitter } from './attributes/attr'
import { setupAttrs } from './attributes/setup'

export function append(element: Element, raw: string, emitter: Emitter) {
	const template = document.createElement('template')
	template.innerHTML = raw

	setupAttrs(template.content, emitter)

	element.append(template.content)
}

export function add(element: Element, children: Array<Node>, emitter: Emitter) {
	for (const child of children) {
		element.append(child)
	}

	setupAttrs(element, emitter)
}

export function swap(element: Element, raw: string, emitter: Emitter) {
	const template = document.createElement('template')
	template.innerHTML = raw

	setupAttrs(template.content, emitter)

	element.replaceWith(template.content)
}

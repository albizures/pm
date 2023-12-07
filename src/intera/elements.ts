import type { Attr } from './attributes/attr'

export type ElementMetadata = {
	attrsSetup: Set<Attr>
}

export const elements = new WeakMap<HTMLElement, ElementMetadata>()

export function isSetup(element: HTMLElement, attr: Attr) {
	const metadata = elements.get(element)

	return Boolean(metadata && metadata.attrsSetup.has(attr))
}

export function saveAsSetup(element: HTMLElement, attr: Attr) {
	const metadata = elements.get(element) ?? {
		attrsSetup: new Set(),
	}

	metadata.attrsSetup.add(attr)

	elements.set(element, metadata)
}

import type * as mitt from 'mitt'
import { isSetup, saveAsSetup } from '../elements'

export const prefix = 'it'

type Prefix = typeof prefix

type CreateNames<Divider extends ':' | '-', Name extends string> = `${Prefix}${Divider}${Name}`

export enum Attr {
	// binds
	Text = 'text',
	ClassName = 'class',
	HtmlAppend = 'html-append',
	HtmlSwap = 'html-swap',
	HtmlMount = 'html-mount',

	// interactions
	Click = 'click',
}

export type AttrName = CreateNames<'-', Attr>
export type AttrAndName = `${CreateNames<'-', Attr>}="${string}"`
export type AttrQuery = `[${AttrName}]`
export type AttrEventName = `${CreateNames<':', Attr>}:${string}`
export type HtmlAttrEventName = `${CreateNames<':', Attr.HtmlAppend | Attr.HtmlSwap>}:${string}`

export function getAttrName(attr: Attr): AttrName {
	return `${prefix}-${attr}` as const
}

export function getAttrQuery(attr: Attr): AttrQuery {
	return `[${getAttrName(attr)}]` as const
}

export function createAttr(attr: Attr, value: string): AttrAndName {
	return `${getAttrName(attr)}="${value}"` as const
}

export function selectAllWithAttr(parent: ParentNode, attr: Attr) {
	return parent.querySelectorAll(getAttrQuery(attr))
}

export function getAttrValue(element: HTMLElement, attr: Attr) {
	return element.getAttribute(getAttrName(attr)) ?? undefined
}

export function getAttrEventName(name: Attr, value: string): AttrEventName {
	return `${prefix}:${name}:${value}` as const
}

type BindSetupFn = (element: HTMLElement, value: string, emitter: Emitter) => void
export type Events = Record<AttrEventName, string>
export type Emitter = mitt.Emitter<Events>

export function setupAllAttrTypeFactory(attr: Attr, setup: BindSetupFn) {
	return (parent: ParentNode, emitter: Emitter) => {
		for (const element of selectAllWithAttr(parent, attr)) {
			if (element instanceof HTMLElement && !isSetup(element, attr)) {
				saveAsSetup(element, attr)

				const value = getAttrValue(element, attr)
				if (value) {
					setup(element, value, emitter)
				}
			}
		}
	}
}

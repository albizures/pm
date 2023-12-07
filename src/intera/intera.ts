import { rootConsola } from '../consola/consola'
import { createId } from '../identifiers'
import type { AnyPrimitive } from '../component'
import type { AttrEventName, AttrName } from './attributes/attr'
import { Attr, createAttr, getAttrEventName, getAttrName } from './attributes/attr'
import { add, append } from './dom'
import { createEmitter } from './config'

const consola = rootConsola.withTag('intera')

export type EventHandler = (event: unknown) => void

export type Bind = {
	defaultValue: AnyPrimitive
	name: AttrEventName
	value: AnyPrimitive
	attrName: AttrName
	attr: string
}

export function createIntera() {
	const emitter = createEmitter()
	consola.debug('creating intera')

	const intera = {
		emitter,
		interaction(attr: Attr, value: string, eventHandler: EventHandler) {
			const name = getAttrEventName(attr, value)

			emitter.on(name, eventHandler)

			return {
				name,
				// attrName:
				attrName: getAttrName(attr),
				value,
				attr: createAttr(attr, value),
			}
		},
		click(eventHandler: EventHandler) {
			const id = createId('click', true)
			return intera.interaction(Attr.Click, id, eventHandler)
		},
		emit(event: { name: AttrEventName }, value: string) {
			emitter.emit(event.name, value)
		},
		text(value: string, defaultValue?: AnyPrimitive) {
			return intera.bind(Attr.Text, value, defaultValue)
		},
		html(type: 'swap' | 'append', value: string) {
			return intera.bind(type === 'swap' ? Attr.HtmlSwap : Attr.HtmlAppend, value, value)
		},
		htmlMount(value: string) {
			return intera.bind(Attr.HtmlMount, value)
		},
		bind(attr: Attr, value: string, defaultValue?: AnyPrimitive) {
			return {
				defaultValue,
				name: getAttrEventName(attr, value),
				attrName: getAttrName(attr),
				value,
				attr: createAttr(attr, value),
			}
		},
		add(element: Element, ...children: Array<Node>) {
			add(element, children, emitter)
		},
		append(element: Element, raw: string) {
			append(element, raw, emitter)
		},
	} as const

	return intera
}

export type Intera = ReturnType<typeof createIntera>

export const intera = createIntera()

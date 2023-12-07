import { intera } from '../intera/intera'
import { Attr, getAttrEventName, getAttrName } from '../intera/attributes/attr'
import { $ } from '../signal'
import type { AnyPrimitive, Props } from '../component'
import { p, span } from '../elements'

type TextProps = Props<{
	as?: 'span' | 'p'
	value?: AnyPrimitive
}>

export function t<TValue extends AnyPrimitive>(value: $.Signal<TValue>, props?: TextProps) {
	const id = $.getSignalId(value)!
	const { as = 'span' } = props ?? {}
	const attr = getAttrName(Attr.Text)
	const eventName = getAttrEventName(Attr.Text, id)

	$.effect(() => {
		intera.emitter.emit(eventName, String(value()))
	})

	const attrs = {
		[attr]: id,
	} as const

	if (as === 'p') {
		return p(attrs, `${value()}`)
	}

	if (as === 'span') {
		return span(attrs, `${value()}`)
	}
}

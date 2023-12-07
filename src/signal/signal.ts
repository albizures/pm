import {
	type ObservableReadonly as ReadonlySignal,
	type Observable as Signal,
	observable as createSignal,
	memo,
} from 'oby'

import { rootConsola } from '../consola/consola'
import { createId } from '../identifiers'

const _consola = rootConsola.withTag('signal')

type AnySignal = Signal<any>

const ids = new Map<AnySignal, string>()

export function computed<TValue>(fn: (() => TValue)): ReadonlySignal<TValue> {
	const item = memo(fn)

	ids.set(item, createId('computed', true))

	return item
}

export function signal<TValue>(value: TValue) {
	const item = createSignal(value)

	ids.set(item, createId('signal', true))

	return item
}

export function getSignalId<TValue>(item: Signal<TValue>) {
	if (ids.has(item)) {
		return ids.get(item)
	}

	const id = createId('signal', true)

	ids.set(item, id)

	return id
}

export {
	isObservable as isSignal,
	effect,
	if,
	type Observable as Signal,
	type ObservableReadonly as ReadonlySignal,
} from 'oby'

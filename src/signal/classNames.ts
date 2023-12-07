import { clsx } from 'clsx'
import { rootConsola } from '../consola/consola'
import { createId } from '../identifiers'
import { intera } from '../intera/intera'
import { $ } from '.'

const _consola = rootConsola.withTag('className')

function classNameAttr(id: string, value: string) {
	return {
		class: value,
		'it-class': id,
	}
}

export function classNames(...args: Array<string | $.Signal<string> | undefined>) {
	const id = createId('className', true)
	const value = $.computed(() => {
		return clsx(...args.map((item) => {
			if ($.isSignal(item)) {
				return item()
			}

			return item
		}))
	})

	$.effect(() => {
		intera.emitter.emit(`it:class:${id}`, value())
	})

	return {
		attr: classNameAttr(id, value()),
	}
}

import type { AnyPrimitive } from './component'
import { consola } from './consola/consola'

type Mapper<TItem> = (value: TItem, index: number, array: Array<TItem>) => string
type AsyncMapper<TItem> = (value: TItem, index: number, array: Array<TItem>) => Promise<string> | string

export function map<TItem>(list: Array<TItem>, mapper: Mapper<TItem>) {
	return list.map(mapper).join('')
}

export async function toMap<TItem>(list: Array<TItem>, mapper: AsyncMapper<TItem>) {
	return Promise.all(list.map(mapper)).then((result) => result.join(''))
}

export async function html(templates: TemplateStringsArray, ...substitutions: Array<AnyPrimitive | Promise<AnyPrimitive >>) {
	let templatesLeft: Array<string> = [...templates]
	let substitutionsLeft: Array<AnyPrimitive | Promise<AnyPrimitive >> = [...substitutions]

	let result = ''
	while (true) {
		const current = templatesLeft[0]
		const currentSustitution = substitutionsLeft[0]

		templatesLeft = templatesLeft.slice(1, templatesLeft.length)
		substitutionsLeft = substitutionsLeft.slice(1, substitutionsLeft.length)

		result += current

		if (typeof currentSustitution === 'object') {
			result += String(await currentSustitution)
		}
		else if (currentSustitution !== undefined) {
			result += String(currentSustitution)
		}
		else {
			break
		}

		if (current === undefined) {
			break
		}
	}

	return result.trim()
}

html.nothing = ''

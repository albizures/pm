import type { Jsonifiable } from 'type-fest'

const devPrefix = '__dev__' as const

export function setDevItem(name: string, value: Jsonifiable) {
	localStorage.setItem(`${devPrefix}${name}`, JSON.stringify(value))
}

export function getDevItem(name: string) {
	const value = localStorage.getItem(`${devPrefix}${name}`)
	return value ? JSON.parse(value) : undefined
}

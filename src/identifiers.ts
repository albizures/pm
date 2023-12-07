const ids = new Set<string>()

let counter = 0

function appendCounter(id: string) {
	return `${id}-${++counter}`
}

function sanitizeId(rawId: string) {
	return rawId.replace(/\//g, '-')
}

export function createId(rawId: string, withCounter = false) {
	const id = withCounter
		? appendCounter(sanitizeId(rawId))
		: sanitizeId(rawId)

	if (ids.has(id)) {
		throw new Error(`creating duplicated ids ${id}`)
	}

	return id
}

export function createIdAttr(rawId: string) {
	const id = rawId.replace(/\//g, '-')
	if (ids.has(id)) {
		throw new Error(`creating duplicated ids ${id}`)
	}

	ids.add(id)

	return {
		id,
		attr: `id=${id}`,
	}
}

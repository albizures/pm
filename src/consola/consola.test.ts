import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Consola } from './consola'

const testReporter = {
	log: vi.fn(),
}

function create() {
	return new Consola({
		reporters: [testReporter],
	})
}

beforeEach(() => {
	testReporter.log.mockReset()
})

it('should have level 3 by default', () => {
	const consola = create()
	expect(consola.getLevel()).toBe(3)
})

it('should log an error', () => {
	const consola = create()

	consola.error('value')

	expect(testReporter.log).toHaveBeenCalledOnce()
	expect(testReporter.log).toHaveBeenCalledWith(expect.objectContaining({
		type: 'error',
		tag: '',
		args: expect.arrayContaining(['value']),
	}))
})

it('should inherit parent\'s tag', () => {
	const consola = create()
	const fooConsola = consola.withTag('foo')
	const barConsola = fooConsola.withTag('bar')

	expect(barConsola.tag).toBe('foo:bar')
})

it('should share parent\'s level', () => {
	const consola = create()

	consola.level = 4

	const fooConsola = consola.withTag('foo')

	expect(fooConsola.getLevel()).toBe(4)
})

describe('when set a level', () => {
	it('should ignore parent\'s level', () => {
		const consola = create()

		consola.level = 4

		const fooConsola = consola.withTag('foo')

		fooConsola.level = 2
		expect(fooConsola.getLevel()).toBe(2)
	})
})

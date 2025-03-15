import type { ReadSignal, Signal } from '@vyke/taggy/signals'
import { signal } from '@vyke/taggy/signals'
import { rootSola } from '../logger'

const sola = rootSola.withTag('box')

type Options<TValue> = {
	name: string
	getId: (value: TValue) => number
}

export function createBox<TValue>(options: Options<TValue>) {
	const { name, getId } = options

	type $Value = Signal<TValue>
	const signalById = new Map<number, $Value>()
	const byId = new Map<number, TValue>()
	const $values = signal<Array<$Value>>([])

	let tempUpdate: Array<$Value> = []
	let syncTimeout: ReturnType<typeof setTimeout> | undefined

	function $remove($value: $Value): void {
		const id = getId($value())
		signalById.delete(id)
		byId.delete(id)
		$values([...$values().filter((item) => item !== $value)])
	}

	function sync(): void {
		if (syncTimeout) {
			clearTimeout(syncTimeout)
		}

		syncTimeout = setTimeout(() => {
			$values([...$values(), ...tempUpdate])
			tempUpdate = []
		}, 10)
	}

	function add(newValue: TValue): $Value {
		const id = getId(newValue)
		const $saved = signalById.get(id)

		if ($saved) {
			sola.error('Adding an already added value into box with the same id:', name, newValue)
			return $saved
		}

		const $signal = signal(newValue)

		signalById.set(id, $signal)
		byId.set(id, newValue)

		tempUpdate.push($signal)
		sync()
		return $signal
	}

	return {
		add,
		$get(value: TValue): $Value | undefined {
			const id = getId(value)
			const $signal = signalById.get(id)

			if ($signal) {
				return $signal
			}

			return undefined
		},
		$getById(id: number): $Value | undefined {
			return signalById.get(id)
		},

		$remove,

		remove(value: TValue): void {
			const id = getId(value)
			const $signal = signalById.get(id)
			if (!$signal) {
				sola.warn('Removing a value that does not exist:', name, value)
				return
			}

			$remove($signal)
		},

		clear(): void {
			const values = $values()
			$values([])
			for (const $value of values) {
				const id = getId($value())
				signalById.delete(id)
				byId.delete(id)
			}
		},

		$values: $values as ReadSignal<Array<$Value>>,
	}
}

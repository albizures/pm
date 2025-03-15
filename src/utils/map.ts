export class BetterWeakMap<TKey extends WeakKey, TValue> {
	public map = new WeakMap<TKey, TValue>()

	constructor(public defaultValue: () => TValue) {}

	get(key: TKey): TValue {
		let value = this.map.get(key)

		if (value === undefined) {
			console.trace('setting default value', key)

			value = this.defaultValue()
			this.map.set(key, value)
		}

		return value
	}

	set(key: TKey, value: TValue) {
		this.map.set(key, value)
	}
}

export class BetterMap<TValue> {
	public map = new Map<number, TValue>()

	constructor(public defaultValue: () => TValue) {}

	get(key: number): TValue {
		let value = this.map.get(key)

		if (value === undefined) {
			value = this.defaultValue()
			this.map.set(key, value)
		}

		return value
	}

	set(key: number, value: TValue) {
		this.map.set(key, value)
	}
}

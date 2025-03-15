import { rootSola } from './logger'

const sola = rootSola.withTag('error')

/**
 * Assert helper
 */
export function assert(condition: unknown, message: string, ...logParams: Array<unknown>): asserts condition {
	if (!condition) {
		if (logParams.length > 0) {
			sola.error(message, ...logParams)
		}
		throw new Error(message)
	}
}

type ErrorValue = string | Error

const VALUE = Symbol('value')
type AnyFn = (...args: Array<any>) => any
export type Maybe<TValue> = {
	[VALUE]: TValue
}

/**
 * Create a maybe value
 * @example
 * ```ts
 * const maybeValue = maybe(someValue)
 * ```
 */
export function maybe<TValue>(value: TValue): Maybe<TValue> {
	return value as unknown as Maybe<TValue>
}

export function empty(): Maybe<undefined> {
	return maybe(undefined)
}

export function emptyPromise(): Promise<Maybe<undefined>> {
	return Promise.resolve(empty())
}


export type Throwable<TFn extends AnyFn> = TFn extends (...args: infer TArgs) => Promise<infer TReturn>
	? (...args: TArgs) => Promise<Maybe<TReturn>>
	: TFn extends (...args: infer TArgs) => infer TReturn
		? (...args: TArgs) => Maybe<TReturn>
		: never

/**
 * Convert a function to a throwable function
 * @example
 * ```ts
 * const fn = throwable(someFunction)
 * ```
 */
export function throwable<TFn extends AnyFn>(fn: TFn): Throwable<TFn> {
	return fn as unknown as Throwable<TFn>
}

type Result<TValue> = {
	ok: true
	value: TValue
} | {
	ok: false
	error: unknown
}

async function handlePromise<TValue>(promise: Promise<Maybe<TValue>>): Promise<Result<TValue>> {
	try {
		const result = await promise

		return { value: result as unknown as TValue, ok: true }
	}
	catch (error) {
		return { error, ok: false }
	}
}

/**
 * Convert a maybe into a result
 * @example
 * ```ts
 * const result = await to(somePromise)
 *
 * if (result.ok) {
 * 	console.log(result.value)
 * } else {
 * 	console.error(result.error)
 * }
 * ```
 */
export function to<TValue>(promise: Promise<Maybe<TValue>>): Promise<Result<TValue>> {
	return handlePromise(promise)
}

/**
 * Unwrap the maybe value from a promise
 * if the promise is rejected, the error will be thrown
 * @example
 * ```ts
 * const value = await unwrap(somePromise)
 * ```
 */
export async function unwrap<TValue>(promise: Promise<Maybe<TValue>>, customError?: unknown): Promise<TValue> {
	try {
		const maybe = await promise

		return maybe as unknown as TValue
	}
	catch (error) {
		if (customError instanceof Error) {
			throw customError
		}
		else if (customError) {
			throw new Error(String(customError))
		}

		throw error
	}
}

export function unwrapOr<TValue>(value: Promise<Maybe<TValue>>, defaultValue: TValue): Promise<TValue> {
	return unwrap(value).catch(() => defaultValue)
}

/**
 * Converts a maybe into a result in a unsafe way
 */
export function expect<TValue>(value: (() => Maybe<TValue>), customError?: ErrorValue): TValue
export function expect<TValue>(value: Maybe<TValue>): TValue
export function expect<TValue>(value: Maybe<TValue> | (() => Maybe<TValue>), customError?: ErrorValue): TValue {
	if (typeof value === 'function') {
		try {
			return value() as unknown as TValue
		}
		catch (error) {
			if (customError) {
				sola.error(error)

				throw (
					customError instanceof Error
						? customError
						: new Error(customError)
				)
			}

			throw error
		}
	}

	return value as unknown as TValue
}

/**
 * Runs the given function in a try catch block to extract unsafe values in a safe way
 */
export function toTry<TValue>(fn: () => TValue, defaultValue?: TValue): Result<TValue> {
	try {
		return { ok: true, value: fn() }
	}
	catch (error) {
		if (defaultValue !== undefined) {
			return { ok: true, value: defaultValue }
		}

		return { ok: false, error }
	}
}

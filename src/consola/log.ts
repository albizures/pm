// eslint-disable-next-line ts/ban-types
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | (number & {})

export const LogTypes = {
	silent: Number.NEGATIVE_INFINITY,
	fatal: 0,
	error: 0,

	warn: 1,

	log: 2,
	info: 3,

	success: 3,
	fail: 3,
	ready: 3,
	start: 3,
	box: 3,

	debug: 4,

	trace: 5,

	verbose: Number.POSITIVE_INFINITY,
} as const

export type LogType = keyof typeof LogTypes

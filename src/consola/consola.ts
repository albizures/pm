import { type LogLevel, type LogType, LogTypes } from './log'
import { Basic } from './reporters/basic'
import type { Reporter } from './reporters/reporter'

type ConsolaArgs = {
	tag?: string
	level?: LogLevel
	parent?: Consola
	reporters?: Array<Reporter>
}

const defaultReporters = [new Basic()]

export class Consola {
	tag: string
	parent?: Consola
	level?: LogLevel
	reporters: Array<Reporter>

	constructor(args?: ConsolaArgs) {
		const { tag = '', parent, level, reporters = defaultReporters } = args ?? {}

		this.level = level
		this.tag = tag
		this.parent = parent
		this.reporters = reporters
	}

	#logType(type: LogType, args: Array<unknown>) {
		const level = this.getLevel()
		const { reporters, tag } = this

		if (level >= LogTypes[type]) {
			for (const reporter of reporters) {
				reporter.log({
					tag,
					type,
					args,
				})
			}
		}
	}

	log(...args: Array<unknown>) {
		this.#logType('log', args)
	}

	error(...args: Array<unknown>) {
		this.#logType('error', args)
	}

	warn(...args: Array<unknown>) {
		this.#logType('warn', args)
	}

	debug(...args: Array<unknown>) {
		this.#logType('debug', args)
	}

	getLevel(): number {
		const { level } = this
		if (typeof level === 'number') {
			// different from its parent
			return level
		}

		return this.parent?.getLevel() ?? 3
	}

	withTag(tag: string) {
		return new Consola({
			tag: this.tag ? `${this.tag}:${tag}` : `${tag}`,
			parent: this,
		})
	}
}

export const consola = new Consola()

export {
	consola as rootConsola,
}
